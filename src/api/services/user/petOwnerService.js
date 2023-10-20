const { BaseUserService } = require("./baseUserService");
const prisma = require("../../../../prisma/prisma");
const { AccountType, AccountStatus } = require("@prisma/client");
const UserError = require("../../errors/userError");
const CustomError = require("../../errors/customError");
const UserHelper = require('../../helpers/usersHelper')
const emailTemplate = require('../../resource/emailTemplate');
const emailService = require("../emailService");

// Shared selection fields
const petOwnerSelectFields = {
  firstName: true,
  lastName: true,
  contactNumber: true,
  dateOfBirth: true,
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

class PetOwnerService extends BaseUserService {
  constructor() {
    super();
  }

  async createUser(data) {
    try {
      const hashedPassword = await this.hashPassword(data.password);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          accountType: AccountType.PET_OWNER,
          accountStatus: AccountStatus.PENDING_VERIFICATION,
          petOwner: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              contactNumber: data.contactNumber,
              dateOfBirth: data.dateOfBirth,
            },
          },
        },
      });

      const token = UserHelper.generateUniqueToken();
      const link = `http://localhost:3002/verify-email/?token=${token}`
      const body = emailTemplate.AccountEmailVerificationEmail(user.firstName, link)
      await this.createVerifyEmailRecord(token, user.email)
      await emailService.sendEmail(user.email, "Verify Your Email Address for PetHub Registration", body)
      return this.removePassword(user);
    } catch (error) {
      console.error("Error during user creation:", error);
      throw new UserError(error);
    }
  }

  async getAllUsers() {
    try {
      return await prisma.petOwner.findMany({
        select: petOwnerSelectFields,
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new UserError(error);
    }
  }

  async getUserById(userId) {
    try {
      const user = await prisma.petOwner.findUnique({
        where: { userId },
        select: petOwnerSelectFields,
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
      const updatedUser = await prisma.$transaction(async (prismaClient) => {
        if (data.email) {
          await prismaClient.user.update({
            where: { userId },
            data: {
              email: data.email,
              lastUpdated: new Date(),
            },
          });
        }

        const user = await prismaClient.petOwner.update({
          where: { userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            contactNumber: data.contactNumber,
            dateOfBirth: data.dateOfBirth,
          },
          include: {
            user: true,
          },
        });
        return user;
      });
      delete updatedUser.user.password;
      return this.removePassword(updatedUser);
    } catch (error) {
      console.error("Error during user update:", error);
      throw new UserError(error);
    }
  }

  async addFavouriteListing(userId, serviceListingId) {
    try {
      // Ensure that user exists and is a valid pet owner
      const user = await prisma.user.findUnique({
        where: { userId },
      });
      if (!user || user.accountType != "PET_OWNER") {
        throw new CustomError(
          "User not found, or id is not tagged to a valid pet owner user account",
          404
        );
      }
      const petOwner = await prisma.petOwner.findUnique({
        where: { userId },
        include: {
          favouriteListings: true,
        },
      });
      const favouriteListings = petOwner.favouriteListings
        ? petOwner.favouriteListings
        : [];

      return await prisma.petOwner.update({
        where: { userId },
        data: {
          favouriteListings: {
            connect: [
              // Connect the existing favorites and add the new one
              ...favouriteListings.map((listing) => ({
                serviceListingId: listing.serviceListingId,
              })),
              {
                serviceListingId: serviceListingId,
              },
            ],
          },
        },
        include: {
          favouriteListings: true,
        },
      });
    } catch (error) {
      console.error("Error when adding to favourites:", error);
      if (error instanceof CustomError) throw error;
      throw new UserError(error);
    }
  }

  async viewAllFavouriteListings(userId, categories) {
    try {
      // Ensure that user exists and is a valid pet owner
      const petOwner = await prisma.user.findUnique({
        where: { userId },
      });
      if (!petOwner || petOwner.accountType != "PET_OWNER") {
        throw new CustomError(
          "User not found, or id is not tagged to a valid pet owner user account",
          404
        );
      }
      const petOwnerWithListings =  await prisma.petOwner.findUnique({
        where: { userId },
        include: {
          favouriteListings: {
            include: {
              tags: true,
              addresses: true,
              petBusiness: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
      });
      // for user's favourited listings, only filter by categories if there are any to be filtered by
      const filteredListings = petOwnerWithListings.favouriteListings.filter((listing) => {
        return categories.length === 0 || categories.includes(listing.category);
      });

      return filteredListings
      
    } catch (error) {
      console.error("Error during view all favourite listings:", error);
      if (error instanceof CustomError) throw error;
      throw new UserError(error);
    }
  }

  async removeFromFavourites(userId, serviceListingIdToRemove) {
    try {
      // Ensure that user exists and is a valid pet owner
      const user = await prisma.user.findUnique({
        where: { userId },
      });
      if (!user || user.accountType != "PET_OWNER") {
        throw new CustomError(
          "User not found, or id is not tagged to a valid pet owner user account",
          404
        );
      }
      const petOwner = await prisma.petOwner.findUnique({
        where: { userId },
        include: {
          favouriteListings: true,
        },
      });
      const favouriteListings = petOwner.favouriteListings
        ? petOwner.favouriteListings
        : [];
      if (favouriteListings.length === 0) {
        throw new CustomError("No favourited listings found!", 404);
      }
      const updatedFavoriteListings = favouriteListings.filter(
        (listing) => listing.serviceListingId !== serviceListingIdToRemove
      );
      return await prisma.petOwner.update({
        where: { userId },
        data: {
          favouriteListings: {
            set: updatedFavoriteListings.map((listing) => ({
              serviceListingId: listing.serviceListingId,
            })),
          },
        },
        include: {
          favouriteListings: true,
        },
      });
    } catch (error) {
      console.error("Error when removing from favourites:", error);
      if (error instanceof CustomError) throw error;
      throw new UserError(error);
    }
  }

  async deleteUser(userId) {
    try {
      return await prisma.user.delete({
        where: { userId },
      });
    } catch (error) {
      console.error("Error during user deletion:", error);
      throw new UserError(error);
    }
  }
}

module.exports = new PetOwnerService();
