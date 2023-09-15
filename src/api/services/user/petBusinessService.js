const { BaseUserService } = require("./baseUserService");
const prisma = require("../../../../prisma/prisma");
const { AccountType, AccountStatus } = require("@prisma/client");
const UserError = require("../../errors/userError");
const CustomError = require("../../errors/customError");
const validations = require("../../validations");
const AddressService = require("./addressService");

// Shared selection fields
const petBusinessSelectFields = {
  companyName: true,
  uen: true,
  businessType: true,
  businessEmail: true,
  businessDescription: true,
  businessAddresses: true,
  petBusinessApplication: {
    select: {
      petBusinessApplicationId: true,
    },
  },
  contactNumber: true,
  websiteURL: true,
  userId: true,
  user: {
    select: {
      userId: true,
      email: true,
      accountType: true,
      accountStatus: true,
      dateCreated: true,
      lastUpdated: true,
    },
  },
};

class PetBusinessService extends BaseUserService {
  constructor() {
    super();
  }

  async createUser(data) {
    try {
      const hashedPassword = await this.hashPassword(data.password);

      if (!(await validations.isValidUEN(data.uen))) {
        throw new CustomError("Invalid UEN Format", 400);
      }

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          accountType: AccountType.PET_BUSINESS,
          accountStatus: AccountStatus.INACTIVE,
          petBusiness: {
            create: {
              companyName: data.companyName,
              uen: data.uen,
              businessType: data.businessType,
              businessEmail: data.businessEmail,
              businessDescription: data.businessDescription,
              contactNumber: data.contactNumber,
              websiteURL: data.websiteURL,
            },
          },
        },
      });

      return this.removePassword(user);
    } catch (error) {
      console.error("Error during user creation:", error);
      throw new UserError(error);
    }
  }

  async getAllUsers() {
    try {
      return await prisma.petBusiness.findMany({
        select: petBusinessSelectFields,
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new UserError(error);
    }
  }

  async getUserById(userId) {
    try {
      const user = await prisma.petBusiness.findUnique({
        where: { userId },
        select: petBusinessSelectFields,
      });

      if (!user) throw new CustomError("User not found", 404);
      return user;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching user by ID:", error);
      throw new UserError(error);
    }
  }

  async updateUser(userId, data) {
    try {
      /*
        For all the address objects in businessAddresses:
          1. If it has an ID, check PB account if there is an address with that ID linked to it, these references will be kept, just the fields updated if neccessary.
          2. For all other addresses linked to the PB account, remove them.
          3. For the addresses provided with no IDs, these are new addresses. Create them.
      */
      const { newAddressIds, disconnectAddresses } =
        await AddressService.getUpdateAddressDetailsFromAddressArray(userId, data.businessAddresses);

      const user = await prisma.petBusiness.update({
        where: { userId },
        data: {
          companyName: data.companyName,
          uen: data.uen,
          businessType: data.businessType,
          businessEmail: data.businessEmail,
          businessDescription: data.businessDescription,
          businessAddresses: {
            disconnect: disconnectAddresses, // Disconnect all address that was not provided with an ID
            connect: newAddressIds.map((id) => ({ addressId: id })), // Link all new addresses (provided with no ID)
          },
          contactNumber: data.contactNumber,
          websiteURL: data.websiteURL,
        },
        include: {
          businessAddresses: true,
        },
      });
      if (!user) throw new CustomError("User not found", 404);
      return this.removePassword(user);
    } catch (error) {
      console.error("Error during user update:", error);
      throw new UserError(error);
    }
  }

  async deleteUser(userId) {
    try {
      return await prisma.petBusiness.delete({
        where: { userId },
      });
    } catch (error) {
      console.error("Error during user deletion:", error);
      throw new UserError(error);
    }
  }
}

module.exports = new PetBusinessService();
