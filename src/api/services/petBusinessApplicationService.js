const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PetBusinessApplicationError = require("../errors/petBusinessApplicationError");
const AddressService = require("./user/addressService");
const EmailService = require("../services/emailService");
const emailTemplate = require("../resource/emailTemplate");

class PetBusinessApplicationService {
  register = async (data) => {
    try {
      // Quick check to prevent active users (/with preexisting PB app data) from calling this
      const userWithPetBusinessAndApplication = await prisma.user.findUnique({
        where: { userId: Number(data.petBusinessId) },
        include: {
          petBusiness: {
            include: {
              petBusinessApplication: true,
            },
          },
        },
      });
      if (!userWithPetBusinessAndApplication) {
        throw new CustomError("User not found", 404);
      }
      if (
        userWithPetBusinessAndApplication.accountStatus !== "INACTIVE" ||
        (userWithPetBusinessAndApplication.petBusiness &&
          userWithPetBusinessAndApplication.petBusiness.petBusinessApplication)
      ) {
        throw new CustomError(
          "Registration not allowed. Account is ACTIVE or already tied with an existing application",
          400
        );
      }
      const petBusinessApplication = await prisma.$transaction(async (prismaClient) => {
        // Create addresses
        let addressIds = [];
        if (data.businessAddresses && data.businessAddresses.length > 0) {
          for (let address of data.businessAddresses) {
            const newAddress = await prismaClient.address.create({
              data: {
                addressName: address.addressName,
                line1: address.line1,
                line2: address.line2,
                postalCode: address.postalCode,
              },
            });
            addressIds.push(newAddress.addressId);
          }
        }

        const petBusinessApplication = await prismaClient.petBusinessApplication.create({
          data: {
            businessType: data.businessType,
            businessEmail: data.businessEmail,
            businessDescription: data.businessDescription,
            stripeAccountId: data.stripeAccountId,
            websiteURL: data.websiteURL,
            attachments: data.attachments || [],
            adminRemarks: [],
            businessAddresses: {
              connect: addressIds.map((id) => ({ addressId: id })),
            },
            petBusiness: {
              connect: {
                userId: Number(data.petBusinessId),
              },
            },
            lastUpdated: new Date(),
          },
          include: {
            businessAddresses: true,
          },
        });

        // AccountStatus: INACTIVE -> PENDING
        await prismaClient.user.update({
          where: { userId: Number(data.petBusinessId) },
          data: { accountStatus: "PENDING" },
        });

        return petBusinessApplication;
      }); // end of transaction

      return petBusinessApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error during pet business application creation:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  updatePetBusinessApplication = async (petBusinessApplicationId, updatedData) => {
    try {
      const existingApplication = await prisma.petBusinessApplication.findUnique({
        where: { petBusinessApplicationId },
        include: { businessAddresses: true },
      });
      if (!existingApplication) {
        throw new CustomError("Pet Business Application not found", 404);
      }
      if (existingApplication.applicationStatus !== "REJECTED") {
        throw new CustomError("Only applications with REJECTED status can be updated by the PB", 400);
      }

      const updatedPetBusinessApplication = await prisma.$transaction(async (prismaClient) => {
        // Delete the old addresses if they exist (these addresses are not linked to the pet business!)
        for (let address of existingApplication.businessAddresses) {
          await prismaClient.address.delete({
            where: { addressId: address.addressId },
          });
        }

        // Make addresses
        let addressIds = [];
        if (updatedData.businessAddresses && updatedData.businessAddresses.length > 0) {
          for (let address of updatedData.businessAddresses) {
            const newAddress = await prismaClient.address.create({
              data: {
                addressName: address.addressName,
                line1: address.line1,
                line2: address.line2,
                postalCode: address.postalCode,
              },
            });
            addressIds.push(newAddress.addressId);
          }
        }

        const updatedPetBusinessApplication = await prismaClient.petBusinessApplication.update({
          where: { petBusinessApplicationId },
          data: {
            ...updatedData, // Keep all the old data (including remarks etc) except the bottom 2 fields
            applicationStatus: "PENDING", // Status goes back to PENDING so InternalUser can go review it again
            businessAddresses: {
              connect: addressIds.map((id) => ({ addressId: id })),
            },
            lastUpdated: new Date(),
          },

          include: {
            businessAddresses: true,
          },
        });

        return updatedPetBusinessApplication;
      }); // end of transaction

      return updatedPetBusinessApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error during pet business application update:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  getAllPetBusinessApplications = async () => {
    try {
      return await prisma.petBusinessApplication.findMany({
        include: {
          businessAddresses: true,
          petBusiness: true,
          approver: true,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching all pet business applications:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  getPetBusinessApplicationById = async (petBusinessApplicationId) => {
    try {
      const petBusinessApplication = await prisma.petBusinessApplication.findUnique({
        where: { petBusinessApplicationId },
        include: {
          businessAddresses: true,
          petBusiness: true,
          approver: true,
        },
      });
      if (!petBusinessApplication) {
        throw new CustomError("Pet Business Application not found", 404);
      }
      return petBusinessApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching pet business application by ID:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  getPetBusinessApplicationByPBId = async (id) => {
    try {
      const petBusinessApplication = await prisma.petBusinessApplication.findUnique({
        where: { petBusinessId: id },
        include: {
          businessAddresses: true,
          approver: true,
        },
      });
      if (!petBusinessApplication) {
        throw new CustomError("Pet Business Application not found.", 404);
      }
      return petBusinessApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching Business Application:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  getPetBusinessApplicationByStatus = async (applicationStatus) => {
    try {
      const petBusinessApplication = await prisma.petBusinessApplication.findMany({
        where: { applicationStatus: applicationStatus },
        include: {
          businessAddresses: true,
          petBusiness: true,
          approver: true,
        },
      });
      return petBusinessApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching pet business applications by application status:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  approvePetBusinessApplication = async (id, approverId) => {
    try {
      // just a quick check to terminate early + return custom message if invalid + check that the tied PB's AccountStatus is PENDING only + get email details later
      const associatedPetBusinessApp = await prisma.petBusinessApplication.findUnique({
        where: { petBusinessApplicationId: id },
        include: {
          petBusiness: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!associatedPetBusinessApp) {
        throw new CustomError("Pet Business Application not found", 404);
      }
      if (associatedPetBusinessApp.petBusiness.user.accountStatus !== "PENDING") {
        throw new CustomError("Pet Business does not have have accountStatus PENDING", 400);
      }

      const updatedApplication = prisma.$transaction(async (prismaClient) => {
        // Attempt update - PB APP - BusinessApplicationStatus: PENDING/REJECTED -> APPROVED
        const updatedApplication = await prismaClient.petBusinessApplication.update({
          where: { petBusinessApplicationId: id },
          data: { applicationStatus: "APPROVED", approverId: approverId },
          include: {
            businessAddresses: true,
            petBusiness: true,
            approver: true,
          },
        });

        // For each address in the PB app, also link to the PB
        const addresses = await AddressService.getAllAddressesForPetBusinessApplication(id);
        for (let address of addresses) {
          await prismaClient.address.update({
            where: { addressId: address.addressId },
            data: {
              petBusinessId: associatedPetBusinessApp.petBusiness.userId,
            },
          });
        }

        // Attempt update - PB and User - AccountStatus: PENDING only -> ACTIVE, ALSO UPDATE the PB with the new fields from the approved application
        await prismaClient.user.update({
          where: { userId: associatedPetBusinessApp.petBusiness.userId },
          data: {
            accountStatus: "ACTIVE",
            petBusiness: {
              update: {
                businessType: updatedApplication.businessType,
                websiteURL: updatedApplication.websiteURL,
                businessDescription: updatedApplication.businessDescription,
                businessEmail: updatedApplication.businessEmail,
                stripeAccountId: updatedApplication.stripeAccountId,
              },
            },
          },
        });

        return updatedApplication;
      }); // end of transaction

      // Notify PB by email
      const name = associatedPetBusinessApp.petBusiness.companyName;
      const link = "http://localhost:3002/business/application";
      const body = emailTemplate.petBusinessApplicationApprovalEmail(name, link);

      // Don't await the sending of email (will block client), instead promise to catch the error later
      EmailService.sendEmail(
        associatedPetBusinessApp.petBusiness.user.email,
        "PetHub - Business Partner Application Approved",
        body
      ).catch((error) => {
        console.error("Error sending approval email:", error);
      });

      return updatedApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error during pet business application approval:", error);
      throw new PetBusinessApplicationError(error);
    }
  };

  rejectPetBusinessApplication = async (id, remark) => {
    try {
      // Just a quick check to terminate early + return custom message if invalid + pass in the PB fields for email later
      const associatedPetBusinessApp = await prisma.petBusinessApplication.findUnique({
        where: { petBusinessApplicationId: id },
        include: {
          businessAddresses: true,
          petBusiness: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!associatedPetBusinessApp) {
        throw new CustomError("Pet Business Application not found", 404);
      }

      // Attempt update - PB APP - BusinessApplicationStatus: PENDING/REJECTED -> REJECTED, append remarl
      const updatedApplication = await prisma.petBusinessApplication.update({
        where: { petBusinessApplicationId: id },
        data: {
          applicationStatus: "REJECTED",
          adminRemarks: {
            push: remark,
          },
        },
      });

      // Notify PB by email
      const name = associatedPetBusinessApp.petBusiness.companyName;
      const link = "http://localhost:3002/business/application";
      const body = emailTemplate.petBusinessApplicationRejectionEmail(name, link, remark);

      // Don't await the sending of email (will block client), instead promise to catch the error later
      EmailService.sendEmail(
        associatedPetBusinessApp.petBusiness.user.email,
        "PetHub - Business Partner Application Rejected",
        body
      ).catch((error) => {
        console.error("Error sending rejection email:", error);
      });

      return updatedApplication;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error during pet business application rejection:", error);
      throw new PetBusinessApplicationError(error);
    }
  };
}

module.exports = new PetBusinessApplicationService();
