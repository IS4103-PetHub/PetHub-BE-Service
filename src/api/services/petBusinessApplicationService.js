const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PetBusinessApplicationError = require("../errors/petBusinessApplicationError");
const AddressService = require("./user/addressService");

exports.register = async (data) => {
  try {
    // Abstract to its own addressService if have time
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

exports.updatePetBusinessApplication = async (petBusinessApplicationId, updatedData) => {
  try {
    const existingApplication = await prisma.petBusinessApplication.findUnique({
      where: { petBusinessApplicationId },
      include: { businessAddresses: true },
    });
    if (!existingApplication) {
      throw new CustomError("Pet Business Application not found", 404);
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
      },
    });
    if (!petBusinessApplication) {
      throw new CustomError("Pet Business Application not found.");
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
