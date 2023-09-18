const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PetBusinessApplicationError = require("../errors/petBusinessApplicationError");
const AddressService = require("./user/addressService");
const EmailService = require("../services/emailService");
const emailTemplate = require("../resource/emailTemplate");

exports.register = async (data) => {
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

    // Create addresses
    let addressIds = [];
    if (data.businessAddresses && data.businessAddresses.length > 0) {
      for (let address of data.businessAddresses) {
        const newAddress = await AddressService.createAddress(address);
        addressIds.push(newAddress.addressId);
      }
    }

    const petBusinessApplication = await prisma.petBusinessApplication.create({
      data: {
        businessType: data.businessType,
        businessEmail: data.businessEmail,
        businessDescription: data.businessDescription,
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
    await prisma.user.update({
      where: { userId: Number(data.petBusinessId) },
      data: { accountStatus: "PENDING" },
    });

    return petBusinessApplication;
  } catch (error) {
    console.error("Error during pet business application creation:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.updatePetBusinessApplication = async (petBusinessApplicationId, updatedData) => {
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

    // Delete the old addresses if they exist (these addresses are not linked to the pet business!)
    for (let address of existingApplication.businessAddresses) {
      AddressService.deleteAddress(address.addressId);
    }

    // Make addresses
    let addressIds = [];
    if (updatedData.businessAddresses && updatedData.businessAddresses.length > 0) {
      for (let address of updatedData.businessAddresses) {
        const newAddress = await AddressService.createAddress(address);
        addressIds.push(newAddress.addressId);
      }
    }

    const updatedPetBusinessApplication = await prisma.petBusinessApplication.update({
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
  } catch (error) {
    console.error("Error during pet business application update:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.getAllPetBusinessApplications = async () => {
  try {
    return await prisma.petBusinessApplication.findMany({
      include: {
        businessAddresses: true,
        petBusiness: true,
        approver: true,
      },
    });
  } catch (error) {
    console.error("Error fetching all pet business applications:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.getPetBusinessApplicationById = async (petBusinessApplicationId) => {
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
    console.error("Error fetching pet business application by ID:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.getPetBusinessApplicationByPBId = async (id) => {
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
    console.error("Error fetching Business Application:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.getPetBusinessApplicationByStatus = async (applicationStatus) => {
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
    console.error("Error fetching pet business applications by application status:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.approvePetBusinessApplication = async (id, approverId) => {
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

    // Attempt update - PB APP - BusinessApplicationStatus: PENDING/REJECTED -> APPROVED
    const updatedApplication = await prisma.petBusinessApplication.update({
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
      await AddressService.updateAddressIdForPetBusiness(
        address.addressId,
        associatedPetBusinessApp.petBusiness.userId
      );
    }

    // Attempt update - PB and User - AccountStatus: PENDING only -> ACTIVE, ALSO UPDATE the PB with the new fields from the approved application
    await prisma.user.update({
      where: { userId: associatedPetBusinessApp.petBusiness.userId },
      data: {
        accountStatus: "ACTIVE",
        petBusiness: {
          update: {
            businessType: updatedApplication.businessType,
            websiteURL: updatedApplication.websiteURL,
            businessDescription: updatedApplication.businessDescription,
            businessEmail: updatedApplication.businessEmail,
          },
        },
      },
    });

    // Notify PB by email
    const name = associatedPetBusinessApp.petBusiness.companyName;
    const link = "http://localhost:3002";
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
    console.error("Error during pet business application approval:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

exports.rejectPetBusinessApplication = async (id, remark) => {
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
    const link = "http://localhost:3002";
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
    console.error("Error during pet business application rejection:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};

// This function is for testing
exports.deletePetBusinessApplicationByPBId = async (id) => {
  try {
    const petBusinessApplication = await prisma.petBusinessApplication.findUnique({
      where: { id },
      include: { businessAddresses: true },
    });

    // We don't wanna delete approved applications (those are tied to the PB already)
    if (!petBusinessApplication) {
      throw new CustomError("Pet Business Application not found", 404);
    }
    if (petBusinessApplication.applicationStatus === "APPROVED") {
      throw new CustomError("Cannot delete an approved application", 400);
    }

    // Remove addresses
    for (let address of petBusinessApplication.businessAddresses) {
      await AddressService.deleteAddress(address.addressId);
    }

    await prisma.petBusinessApplication.delete({
      where: { petBusinessId },
    });
  } catch (error) {
    console.error("Error deleting Pet Business Application", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetBusinessApplicationError(error);
    }
  }
};
