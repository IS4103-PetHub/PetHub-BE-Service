
const prisma = require('../../../../prisma/prisma');
const petBusinessService = require('../../services/user/petBusinessService')
const petOwnerService = require('../../services/user/petOwnerService')
const CustomError = require('../../errors/customError')
const OrderItemsError = require('../../errors/orderItemError')
const { OrderItemStatus } = require('@prisma/client')


class OrderItemService {
    constructor() { }

    async getPetOwnerOrderItemsById(petOwnerId, statusFilterArray = undefined) {
        try {
            const petOwner = await petOwnerService.getUserById(petOwnerId)

            const serviceListings = await prisma.invoice.findMany({
                where: { petOwnerUserId: petOwner.userId },
                include: {
                    orderItems: true
                }
            })
            let orderItems = serviceListings
                .map(serviceListing => serviceListing.orderItems)
                .flat()

            if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, statusFilterArray)

            return orderItems
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error)
        }
    }


    filterOrderItems(orderItems, statusFilterArray = Object.values(OrderItemStatus)) {
        const statusFilter = new Set(statusFilterArray);
        return orderItems.filter(orderItem => statusFilter.has(orderItem.status));
    }
}

module.exports = new OrderItemService()