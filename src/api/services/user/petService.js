const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const PetError = require("../../errors/petError");
const s3ServiceInstance = require("../s3Service");

exports.createPet = async (data) => {
  try {
    // Ensure that pet owner exists
    const petOwner = await prisma.user.findUnique({
      where: { userId: data.petOwnerId },
    });
    if (!petOwner || petOwner.accountType != "PET_OWNER") {
      throw new CustomError(
        "User not found, or id is not tagged to a valid pet owner user account",
        404
      );
    }

    const pet = await prisma.pet.create({
      data: {
        petName: data.petName,
        petType: data.petType,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        petWeight: data.weight,
        microchipNumber: data.microchipNumber,
        attachmentURLs: data.attachmentURLs,
        attachmentKeys: data.attachmentKeys,
        petOwner: {
          connect: {
            userId: data.petOwnerId,
          }
        }
      },
    });
    return pet;
  } catch (error) {
    console.error("Error during pet creation:", error);
    if (error instanceof CustomError) throw error;
    throw new PetError(error);
  }
};

exports.updatePet = async (petId, data) => {
  try {
    // Ensure that pet exists
    const updatePet = await prisma.pet.findUnique({
      where: { petId: petId },
    });
    if (!updatePet) {
      throw new CustomError("Pet not found", 404);
    }

    const pet = await prisma.pet.update({
      where: { petId },
      data: {
        petName: data.petName,
        petType: data.petType,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        petWeight: data.weight,
        microchipNumber: data.microchipNumber,
        attachmentURLs: data.attachmentURLs,
        attachmentKeys: data.attachmentKeys,
        lastUpdated: new Date(),
      },
    });

    return pet;
  } catch (error) {
    console.error("Error during pet update:", error);
    throw new PetError(error);
  }
};

exports.getAllPets = async () => {
  try {
    return await prisma.pet.findMany({
      include: {
        bookings: true
      }
    });
  } catch (error) {
    console.error("Error fetching all pets:", error);
    throw new PetError(error);
  }
};

exports.getPetById = async (petId) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { petId },
      include: {
        bookings: true
      }
    });
    if (!pet) {
      throw new CustomError("Pet not found", 404);
    }
    return pet;
  } catch (error) {
    console.error("Error fetching pet by ID:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetError(error);
    }
  }
};

exports.getPetsByPOId = async (petOwnerId) => {
  try {
    // verify that petOwnerId belongs to a pet owner
    const user = await prisma.user.findUnique({
      where: {userId: petOwnerId}
    })
    if (!user || user.accountType != "PET_OWNER") {
      throw new CustomError("User not found, or id is not tagged to a valid pet owner user account", 404);
    }
    const pets = await prisma.pet.findMany({
      where: { petOwnerId: petOwnerId },
      include: {
        bookings: true
      }
    });
    return pets;
  } catch (error) {
    console.error("Error fetching pets by pet owner ID:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new PetError(error);
    }
  }
};

// Will automatically delete existing pets from pet owner's pet list
exports.deletePet = async (petId) => {
  try {
    await prisma.pet.delete({
      where: { petId },
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    throw new PetError(error);
  }
};

exports.deleteFilesOfAPet = async (petId) => {
  try {
    // delete files from S3
    const pet = await prisma.pet.findUnique({
      where: { petId },
    });
    if (!pet) {
      throw new CustomError("Pet not found", 404);
    }
    await s3ServiceInstance.deleteFiles(pet.attachmentKeys);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new PetError(error);
  }
};
