const CustomError = require("../../errors/customError");
const PetLostAndFoundError = require('../../errors/petLostAndFoundError')
const petOwnerService = require("../user/petOwnerService");
const { PetLostRequestType } = require('@prisma/client')
const s3ServiceInstance = require("../s3Service");
const prisma = require("../../../../prisma/prisma");


class PetLostAndFoundService {

    async getAllPetLostAndFound(requestType) {
        try {
            const petLostAndFound = await prisma.petLostAndFound.findMany({
                where: {
                    requestType: requestType ? requestType : {},
                    petOwner: {
                        user: {
                            accountStatus: 'ACTIVE'
                        }
                    }
                },
                include: {
                    pet: true,
                    petOwner: true
                }
            })
            return petLostAndFound
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new PetLostAndFoundError(error)
        }
    }

    async getPetLostAndFoundByPOId(userId) {
        try {
            const petLostAndFound = await prisma.petLostAndFound.findMany({
                where: {
                    userId: Number(userId)
                },
                include: {
                    pet: true
                }
            })
            return petLostAndFound
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new PetLostAndFoundError(error)
        }
    }

    async createPetLostAndFound(payload, userId) {
        try {
            const petOwner = await petOwnerService.getUserById(userId) // validate if valid PO

            const lostAndFoundPayload = {
                title: payload.title,
                description: payload.description,
                requestType: PetLostRequestType[payload.requestType],
                lastSeenDate: new Date(payload.lastSeenDate),
                lastSeenLocation: payload.lastSeenLocation,
                attachmentURLs: payload.attachmentURLs,
                attachmentKeys: payload.attachmentKeys,
                contactNumber: payload.contactNumber,
                petOwner: {
                    connect: {
                        userId: userId
                    }
                }
            }

            if (payload.petId) {
                lostAndFoundPayload.pet = {
                    connect: {
                        petId: Number(payload.petId)
                    }
                }
            }

            const lostAndFound = await prisma.petLostAndFound.create({
                data: lostAndFoundPayload,
                include: {
                    pet: true,
                    petOwner: true
                }
            })

            return lostAndFound

        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new PetLostAndFoundError(error)
        }
    }

    async updatePetLostAndFound(payload, petLostAndFoundId) {
        try {

            const checkIfExists = await prisma.petLostAndFound.findUnique({
                where: {petLostAndFoundId}
            })
            if(!checkIfExists) {
                throw new CustomError("Pet Lost and Found not found", 404)
            }

            const lostAndFoundPayload = {
                title: payload.title,
                description: payload.description,
                requestType: PetLostRequestType[payload.requestType],
                lastSeenDate: new Date(payload.lastSeenDate),
                lastSeenLocation: payload.lastSeenLocation,
                attachmentURLs: payload.attachmentURLs,
                attachmentKeys: payload.attachmentKeys,
                contactNumber: payload.contactNumber,
                dateUpdated: new Date()
            }

            if (payload.petId) {
                lostAndFoundPayload.pet = {
                    connect: {
                        petId: Number(payload.petId)
                    }
                }
            }

            if (payload.isResolved) lostAndFoundPayload.isResolved = payload.isResolved === "true"

            const lostAndFound = await prisma.petLostAndFound.update({
                where: {petLostAndFoundId}, 
                data: lostAndFoundPayload,
                include: {
                    pet: true,
                    petOwner: true
                }
            })
            return lostAndFound
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new PetLostAndFoundError(error)
        }
    }

    async deleteFilesOfAPetLostAndFound(petLostAndFoundId) {
        try {
          // delete images from S3
          const petLostAndFound = await prisma.petLostAndFound.findUnique({
            where: { petLostAndFoundId },
          });
          if (!petLostAndFound) {
            throw new CustomError("PetLostAndFound not found", 404);
          }
          await s3ServiceInstance.deleteFiles(petLostAndFound.attachmentKeys);
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          }
          throw new PetLostAndFoundError(error);
        }
      };


      async deletePetLostAndFound(petLostAndFoundId) {
        try {
            await prisma.petLostAndFound.delete({
                where: { petLostAndFoundId }
            })
        } catch(error) {
            throw new PetLostAndFoundError(error)
        }
      }
}

module.exports = new PetLostAndFoundService();