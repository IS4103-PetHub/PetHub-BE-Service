const prisma = require('../../../../prisma/prisma');
const CommissionRuleError = require("../../errors/commissionRuleError");
const CustomError = require('../../errors/customError')
const petBusinessService = require('../../services/user/petBusinessService')
const constants = require("../../../constants/transactions");

class CommissionRulenService {

    async getAllCommissionRules() {
        try {
            return await prisma.commissionRule.findMany({
                include: { petBusinesses: true }
            });
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CommissionRuleError(error);
        }
    }

    async getCommissionRuleById(commissionRuleId) {
        try {
            const commissionRule = await prisma.commissionRule.findUnique({
                where: { commissionRuleId: commissionRuleId },
                include: { petBusinesses: true }
            });

            if (!commissionRule) throw new CustomError('Commission rule not found', 404);
            return commissionRule;
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CommissionRuleError(error);
        }
    }


    async createCommissionRule(payload) {
        try {
            // PetBusinesses to be associated to the newly created commissionRule
            const newCommissionRule = await prisma.commissionRule.create({
                data: {
                    name: payload.name,
                    commissionRate: payload.commissionRate
                }
            });

            // Fetch and return the created user group along with its permissions
            return await this.getCommissionRuleById(newCommissionRule.commissionRuleId);
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CommissionRuleError(error);
        }
    }

    async updateCommissionRule(commissionRuleId, payload) {
        try {
            let setToDefault = [];
            const setToNewCR = new Set();

            // If there are petBusinessIds in the payload, we validate them first
            if (payload.petBusinessIds && payload.petBusinessIds.length) {
                for (const userId of payload.petBusinessIds) {
                    // This will throw an error if the user is not found
                    setToNewCR.add((await petBusinessService.getUserById(userId)).userId);
                }

                // Fetching existing associated petBusinesses and preparing those which are not in setToNewCR
                const existingPetBusinesses = (await this.getCommissionRuleById(commissionRuleId)).petBusinesses;
                setToDefault = existingPetBusinesses
                    .map((pb) => pb.userId)
                    .filter((pbId) => !setToNewCR.has(pbId));
            }

            // Start the transaction
            const updatedCommissionRule = await prisma.$transaction(async (prismaClient) => {
                // Update the commission rule
                const commissionRule = await prismaClient.commissionRule.update({
                    where: { commissionRuleId },
                    data: {
                        name: payload.name,
                        commissionRate: payload.commissionRate,
                    },
                });

                // If there are petBusinessIds in the payload, we update those pet businesses
                if (payload.petBusinessIds && payload.petBusinessIds.length) {
                    // Connect the pet businesses to the updated commission rule
                    for (const userId of setToNewCR) {
                        await prismaClient.petBusiness.update({
                            where: { userId },
                            data: {
                                commissionRule: {
                                    connect: { commissionRuleId: commissionRule.commissionRuleId },
                                },
                            },
                        });
                    }

                    // Set unassociated pet businesses to the default commission rule
                    for (const userId of setToDefault) {
                        await prismaClient.petBusiness.update({
                            where: { userId },
                            data: {
                                commissionRule: {
                                    connect: { commissionRuleId: constants.DEFAULT_CR_ID },
                                },
                            },
                        });
                    }
                }

                return commissionRule;
            });

            // TODO: email PetBusinesses about the affected changes
            console.log("Set to default: ", setToDefault)
            console.log("Set to new CR: ", setToNewCR)
            return await this.getCommissionRuleById(updatedCommissionRule.commissionRuleId);
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CommissionRuleError(error);
        }
    }



    async deleteCommissionRule(commissionRuleId) {
        try {
            if (commissionRuleId === constants.DEFAULT_CR_ID) {
                throw new CustomError('Default commission rule cannot be deleted', 403);
            }

            // Fetching existing associated petBusinesses to associate them with the default Commission Rule
            const existingPetBusinessesIds = (await this.getCommissionRuleById(commissionRuleId)).petBusinesses
                .map((pb) => pb.userId);

            // Start the transaction
            await prisma.$transaction(async (prismaClient) => {
                // Set unassociated pet businesses to the default commission rule
                for (const userId of existingPetBusinessesIds) {
                    await prismaClient.petBusiness.update({
                        where: { userId },
                        data: {
                            commissionRule: {
                                connect: { commissionRuleId: constants.DEFAULT_CR_ID },
                            },
                        },
                    });
                }

                // Delete the commission rule after all pet businesses have been reassigned
                await prismaClient.commissionRule.delete({
                    where: { commissionRuleId: commissionRuleId },
                });
            });

            // TODO: email PetBusinesses about the affected changes
            console.log("Set to default: ", existingPetBusinessesIds)
            return { message: "Commission rule successfully deleted and pet businesses reassigned." };
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CommissionRuleError(error);
        }
    }

}

module.exports = new CommissionRulenService();
