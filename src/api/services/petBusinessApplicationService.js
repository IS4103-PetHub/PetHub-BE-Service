const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PetBusinessApplicationError = require("../errors/petBusinessApplicationError");

exports.register = async (data) => {
  try {
    let addressIds = [];

    // Put in its own addressService if have time
    if (data.businessAddresses && data.businessAddresses.length > 0) {
      for (let address of data.businessAddresses) {
        const newAddress = await prisma.address.create({
          data: {
            addressName: address.addressName,
            line1: address.line1,
            line2: address.line2 || null,
            postalCode: address.postalCode,
          },
        });
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
      },
      include: {
        businessAddresses: true,
      },
    });
    return petBusinessApplication;
  } catch (error) {
    console.error("Error during pet business application creation:", error);
    throw new PetBusinessApplicationError(error);
  }
};

exports.getAllPetBusinessApplications = async () => {
  try {
    return await prisma.petBusinessApplication.findMany({
      include: {
        businessAddresses: true,
      },
    });
  } catch (error) {
    console.error("Error fetching all pet business applications:", error);
    throw new PetBusinessApplicationError(error);
  }
};

exports.getPetBusinessApplicationById = async (petBusinessApplicationId) => {
  try {
    const petBusinessApplication = await prisma.petBusinessApplication.findUnique({
      where: { petBusinessApplicationId },
      include: {
        businessAddresses: true,
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

exports.getPetBusinessApplicationByStatus = async (applicationStatus) => {
  try {
    const petBusinessApplication = await prisma.petBusinessApplication.findMany({
      where: { applicationStatus: applicationStatus },
      include: {
        businessAddresses: true,
      },
    });
    return petBusinessApplication;
  } catch (error) {
    console.error("Error fetching pet business applications by application status:", error);
    throw new PetBusinessApplicationError(error);
  }
};

exports.getPetBusinessApplicationByPBId = async (id) => {
  try {
    const petBusinessApplication = await prisma.petBusinessApplication.findUnique({
      where: { petBusinessId: id },
    });
    if (!petBusinessApplication) {
      throw new CustomError("Pet Business Application not found.");
    }
    return petBusinessApplication;
  } catch (error) {
    console.error("Error fetching Business Application:", error);
    throw new PetBusinessApplicationError(error);
  }
};
