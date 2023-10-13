const serviceListingService = require('../../services/serviceListing/baseServiceListing')
const { OrderItemStatus } = require('@prisma/client');
const CustomError = require('../../errors/customError')
const TransactionError = require('../../errors/transactionError');
const { v4: uuidv4 } = require("uuid");
const crypto = require('crypto');
const prisma = require('../../../../prisma/prisma');
const constants = require("../../../constants/common");

// 1) Payment service builds transaction which returns invoice and orderItems
// 2) Once Payment service confirms payment, payment service must confirm the transaction with the payment ID
class TransactionService {
    constructor() { }

    async getInvoiceById(invoiceId) {
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { invoiceId: invoiceId },
                include: { orderItems: true }
            });

            if (!invoice) throw new CustomError('Invoice not found', 404);
            return invoice;
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new TransactionError(error);
        }
    }

    async confirmTransaction(invoice, orderItems, paymentIntentId, petOwnerID) {
        try {
            // Set the paymentId and petOwnerUserId for the invoice
            invoice.paymentId = paymentIntentId;
            invoice.petOwnerUserId = petOwnerID;  // <-- This line links the PetOwner to the Invoice

            // Execute the Prisma transaction
            const newInvoice = await prisma.$transaction(async (prismaClient) => {
                // Create the invoice
                const createdInvoice = await prismaClient.invoice.create({
                    data: invoice  // This now includes the petOwnerUserId
                });

                // Add the created invoice ID to each order item and create them
                const orderItemsToCreate = orderItems.map(orderItem => ({
                    ...orderItem,
                    invoiceId: createdInvoice.invoiceId
                }));

                await prismaClient.orderItem.createMany({
                    data: orderItemsToCreate
                });

                return createdInvoice;
            });

            return await this.getInvoiceById(newInvoice.invoiceId);
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new TransactionError(error);
        }
    }

    async buildTransaction(cartItems) {
        try {
            // This will be an array of arrays, so we'll need to flatten it
            const nestedOrderItems = await Promise.all(cartItems.map(cartItem => this.buildOrderItem(cartItem)));
            // Flatten the array of arrays into a single array
            const orderItems = nestedOrderItems.flat();

            const totalOrderItemPrice = orderItems.reduce((accumulator, orderItem) => {
                return accumulator + orderItem.itemPrice;
            }, 0); // 0 is the initial value of the accumulator
            const miscCharge = Math.round((totalOrderItemPrice * constants.MISC_CHARGE_PCT) * 100) / 100;

            const invoice = {
                totalPrice: totalOrderItemPrice + miscCharge,
                miscCharge: miscCharge
            }

            return {
                invoice,
                orderItems
            }
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new TransactionError(error);
        }
    }

    async buildOrderItem(cartItem) {
        try {
            const serviceListing = await serviceListingService.getServiceListingById(cartItem.serviceListingId, true);

            const datetime = new Date();
            datetime.setDate(datetime.getDate() + serviceListing.defaultExpiryDays);
            datetime.setHours(23, 59, 59, 999); // sets the time to end of the day: 23:59:59.999
            const expiryDate = serviceListing.lastPossibleDate ? (datetime < serviceListing.lastPossibleDate ? datetime : serviceListing.lastPossibleDate) : datetime;

            const baseOrderItem = {
                itemName: serviceListing.title,
                itemPrice: serviceListing.basePrice,
                serviceListingId: serviceListing.serviceListingId,
                expiryDate,
                status: serviceListing.requiresBooking ? OrderItemStatus.PENDING_BOOKING : OrderItemStatus.PENDING_FULFILLMENT,
                commissionRate: serviceListing.petBusiness.commissionRule.commissionRate,
            };

            // Use JSON methods to create a deep copy of the baseOrderItem for each quantity
            const orderItemArr = Array.from({ length: cartItem.quantity }, () => JSON.parse(JSON.stringify(baseOrderItem)));
            orderItemArr.forEach(item => { item.voucherCode = this.createSixCharacterCode(); });
            return orderItemArr;
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new TransactionError(error);
        }
    }

    createSixCharacterCode() {
        // Generate a new UUID
        const uuid = uuidv4();

        // Create a SHA-256 hash of the UUID
        const hash = crypto.createHash('sha256');
        hash.update(uuid);
        const hashResult = hash.digest('hex');

        // Take the first 6 characters of the hash
        const sixCharacterCode = hashResult.substring(0, 6);

        return sixCharacterCode.toUpperCase(); // converting to uppercase to match traditional voucher code style
    }

}


module.exports = new TransactionService()