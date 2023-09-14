const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Unassociated address creation is possible
exports.createAddress = async (data) => {
  try {
    return await prisma.address.create({
      data: {
        addressName: data.addressName,
        line1: data.line1,
        line2: data.line2 || null,
        postalCode: data.postalCode,
        // only add petBusinessId and petBusinessApplicationId if they exist in data
        ...(data.petBusinessId && { petBusinessId: data.petBusinessId }),
        ...(data.petBusinessApplicationId && { petBusinessApplicationId: data.petBusinessApplicationId }),
      },
    });
  } catch (error) {
    console.error("Error during address creation:", error);
    throw new CustomError("Failed to create address");
  }
};

exports.getAllAddressesForPetBusinessApplication = async (petBusinessApplicationId) => {
  try {
    return await prisma.address.findMany({
      where: { petBusinessApplicationId: petBusinessApplicationId },
    });
  } catch (error) {
    console.error("Error fetching addresses for pet business application:", error);
    throw new CustomError("Failed to fetch addresses");
  }
};

exports.getAllAddressesForPetBusiness = async (petBusinessId) => {
  try {
    return await prisma.address.findMany({
      where: { petBusinessId: petBusinessId },
    });
  } catch (error) {
    console.error("Error fetching addresses for pet business:", error);
    throw new CustomError("Failed to fetch addresses");
  }
};

exports.updateAddressesForPetBusiness = async (addressId, petBusinessId) => {
  try {
    return await prisma.address.update({
      where: { addressId: addressId },
      data: {
        petBusinessId: petBusinessId,
      },
    });
  } catch (error) {
    console.error("Error updating address for pet business:", error);
    throw new CustomError("Failed to update address");
  }
};

exports.deleteAddress = async (addressId) => {
  try {
    await prisma.address.delete({
      where: { addressId: addressId },
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new CustomError("Failed to delete address");
  }
};
