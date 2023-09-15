const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AddressError = require("../../errors/addressError");
const CustomError = require("../../errors/customError");

// Unassociated address creation is possible
exports.createAddress = async (data) => {
  try {
    return await prisma.address.create({
      data: {
        addressName: data.addressName,
        line1: data.line1,
        line2: data.line2,
        postalCode: data.postalCode,
      },
    });
  } catch (error) {
    console.error("Error during address creation:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to create addresses");
    }
  }
};

exports.getAllAddressesForPetBusinessApplication = async (petBusinessApplicationId) => {
  try {
    return await prisma.address.findMany({
      where: { petBusinessApplicationId: petBusinessApplicationId },
    });
  } catch (error) {
    console.error("Error fetching addresses for pet business application:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to fetch addresses");
    }
  }
};

exports.getAllAddressesForPetBusiness = async (petBusinessId) => {
  try {
    return await prisma.address.findMany({
      where: { petBusinessId: petBusinessId },
    });
  } catch (error) {
    console.error("Error fetching addresses for pet business:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to fetch addresses");
    }
  }
};

exports.updateAddressIdForPetBusiness = async (addressId, petBusinessId) => {
  try {
    return await prisma.address.update({
      where: { addressId: addressId },
      data: {
        petBusinessId: petBusinessId,
      },
    });
  } catch (error) {
    console.error("Error updating address for pet business:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to update address");
    }
  }
};

const updateAddressDetailsForAddressWithAddressId = async (address) => {
  try {
    return await prisma.address.update({
      where: { addressId: address.addressId },
      data: {
        addressName: address.addressName,
        line1: address.line1,
        line2: address.line2,
        postalCode: address.postalCode,
      },
    });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to update address");
    }
  }
};

/* 
  This function is being used internally by petBusinessApplicationService
  If desired, create a new function called unlinkAddressFromPetBusiness if the intention is only to unlink from PBs while keeping the address OR
  modify this function to do a check
*/
exports.deleteAddress = async (addressId) => {
  try {
    await prisma.address.delete({
      where: { addressId: addressId },
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError("Failed to delete addresses");
    }
  }
};

/*
  For all the address objects in businessAddresses:
    1. If it has an ID, check PB account if there is an address with that ID linked to it, these references will be kept, just the fields updated if neccessary.
    2. For all other addresses linked to the PB account, remove them.
    3. For the addresses provided with no IDs, these are new addresses. Create them.
  Return a list of IDs of new addresses to link to the PB and a list of IDs of existing addresses to delete from the PB
*/
exports.getUpdateAddressDetailsFromAddressArray = async (userId, businessAddresses) => {
  try {
    let addressIds = [];
    let existingAddressIds = [];

    if (businessAddresses && businessAddresses.length > 0) {
      for (let address of businessAddresses) {
        // If the address has an ID, update its fields and keep its linkages
        if (address.addressId) {
          await updateAddressDetailsForAddressWithAddressId(address);
          existingAddressIds.push(address.addressId);
        } else {
          // If the address does not have an ID, create it
          const newAddress = await exports.createAddress(address);
          addressIds.push(newAddress.addressId);
        }
      }
    }

    const currentUser = await prisma.petBusiness.findUnique({
      where: { userId },
      select: {
        businessAddresses: true,
      },
    });

    const disconnectAddresses = currentUser.businessAddresses
      .filter((addr) => !existingAddressIds.includes(addr.addressId))
      .map((addr) => ({ addressId: addr.addressId }));

    return {
      newAddressIds: addressIds,
      disconnectAddresses,
    };
  } catch (error) {
    console.error(
      "Failed to perform {AddressService: getUpdateAddressDetailsFromAddressArray} when updating a PB's addresses:",
      error
    );
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new AddressError(
        "Failed to perform {AddressService: getUpdateAddressDetailsFromAddressArray} when updating a PB's addresses"
      );
    }
  }
};
