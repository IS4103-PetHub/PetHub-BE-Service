const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PaymentError = require("../errors/paymentError");
const stripeServiceInstance = require("./stripeService.js");
const petOwnerService = require('../services/user/petOwnerService')
const transactionService = require('../services/finance/transactionService')
// const { v4: uuidv4 } = require("uuid"); // uncomment to test without stripe service 
const emailService = require('../services/emailService')
const emailTemplate = require('../resource/emailTemplate');

class PaymentService {
  constructor() { }

  async checkout(data) {
    try {
      const user = await petOwnerService.getUserById(data.userId) // throws error if not pet owner

      // 1) Payment service builds transaction which returns invoice and orderItems
      const { invoice, orderItems } = await transactionService.buildTransaction(data.cartItems)

      // 2) if computed total price != amount given by payload throw error
      if (invoice.totalPrice != data.totalPrice) throw new CustomError(`Bad Request: amount specified (${data.totalPrice}) is incorrect; computed total: ${invoice.totalPrice}`, 400);

      // 3) complete stripe payment to obtain paymentIntentId; throws error if payment fails
      const paymentIntentId = await stripeServiceInstance.processPayment(
        data.paymentMethodId,
        invoice.totalPrice,
        user.email
      );
      // const paymentIntentId = uuidv4(); // uncomment to test without stripe

      // 4) Once Payment service confirms payment, payment service must confirm the transaction with the paymentIntentId
      const confirmedInvoice = await transactionService.confirmTransaction(invoice, orderItems, paymentIntentId, user.userId)

      await emailService.sendEmail(
        user.email,
        `Thank You for Your Purchase, ${user.firstName}! Your PetHub Order is Confirmed`,
        emailTemplate.checkoutSuccessEmail(user.firstName, invoice, "")) // TODO: create link

      return confirmedInvoice;
    } catch (error) {
      console.error("Error during checkout:", error);
      if (error instanceof CustomError) throw error;
      throw new PaymentError(error);
    }
  };


  // supports partial and full refund
  async refund(data) {
    try {
      const refund = await stripeServiceInstance.issuePartialRefund(
        data.paymentIntentId,
        data.amount
      );
      return refund;
    } catch (error) {
      console.error("Error during checkout:", error);
      if (error instanceof CustomError) throw error;
      throw new PaymentError(error);
    }
  };

}

module.exports = new PaymentService();

