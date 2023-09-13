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

exports.getAllAddressesForPetBusiness = async (petBusinessId) => {
  return await prisma.address.findMany({
    where: { petBusinessId: petBusinessId },
  });
};

exports.deleteAddress = async (addressId) => {
  await prisma.address.delete({
    where: { addressId: addressId },
  });
};
