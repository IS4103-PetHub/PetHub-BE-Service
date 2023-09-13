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
