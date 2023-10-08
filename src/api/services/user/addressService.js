const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AddressError = require("../../errors/addressError");
const CustomError = require("../../errors/customError");

class AddressService {
  // Unassociated address creation is possible
  createAddress = async (data) => {
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
      if (error instanceof CustomError) throw error;
      console.error("Error during address creation:", error);
      throw new AddressError("Failed to create addresses");
    }
  };

  getAllAddressesForPetBusinessApplication = async (petBusinessApplicationId) => {
    try {
      return await prisma.address.findMany({
        where: { petBusinessApplicationId: petBusinessApplicationId },
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching addresses for pet business application:", error);
      throw new AddressError("Failed to fetch addresses");
    }
  };

  getAllAddressesForPetBusiness = async (petBusinessId) => {
    try {
      return await prisma.address.findMany({
        where: { petBusinessId: petBusinessId },
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching addresses for pet business:", error);
      throw new AddressError("Failed to fetch addresses");
    }
  };

  updateAddressDetailsForAddressWithAddressId = async (address) => {
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
      if (error instanceof CustomError) throw error;
      console.error("Error updating address:", error);
      throw new AddressError("Failed to update address");
    }
  };

  /*
  For all the address objects in businessAddresses:
    1. If it has an ID, check PB account if there is an address with that ID linked to it, these references will be kept, just the fields updated if neccessary.
    2. For all other addresses linked to the PB account, remove them.
    3. For the addresses provided with no IDs, these are new addresses. Create them.
  Return a list of IDs of new addresses to link to the PB and a list of IDs of existing addresses to delete from the PB
*/
  getUpdateAddressDetailsFromAddressArray = async (userId, businessAddresses) => {
    try {
      let addressIds = [];
      let existingAddressIds = [];

      if (businessAddresses && businessAddresses.length > 0) {
        for (let address of businessAddresses) {
          // If the address has an ID, update its fields and keep its linkages
          if (address.addressId) {
            await this.updateAddressDetailsForAddressWithAddressId(address);
            existingAddressIds.push(address.addressId);
          } else {
            // If the address does not have an ID, create it
            const newAddress = await this.createAddress(address);
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
      if (error instanceof CustomError) throw error;
      console.error(
        "Failed to perform {AddressService: getUpdateAddressDetailsFromAddressArray} when updating a PB's addresses:",
        error
      );
      throw new AddressError(
        "Failed to perform {AddressService: getUpdateAddressDetailsFromAddressArray} when updating a PB's addresses"
      );
    }
  };
}

module.exports = new AddressService();
