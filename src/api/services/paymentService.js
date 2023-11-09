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
      // 1) Payment service builds transaction which returns invoice and orderItems
      const { invoice, orderItems } = await transactionService.buildTransaction(data.cartItems)


      // 2) process points redemption
      const miscChargeInCents = invoice.miscCharge * 100
      const pointsRedeemed = data.pointsRedeemed >= miscChargeInCents ? miscChargeInCents : data.pointsRedeemed;
      const user = await petOwnerService.getUserById(data.userId) // throws error if not pet owner
      if (user.points < pointsRedeemed) {
        throw new CustomError("User does not have sufficient points to redeem", 404);
      }
      invoice.finalMiscCharge = invoice.miscCharge - (pointsRedeemed / 100)
      invoice.pointsRedeemed = pointsRedeemed
      invoice.finalTotalPrice = invoice.totalPrice + invoice.finalMiscCharge

      // 3) if computed total price != amount given by payload throw error
      if (invoice.finalTotalPrice != data.totalPrice) {
        throw new CustomError(`Bad Request: amount specified (${data.totalPrice}) is incorrect; computed total: ${invoice.finalTotalPrice}`, 400);
      }

      // 4) complete stripe payment to obtain paymentIntentId; throws error if payment fails
      const paymentIntentId = await stripeServiceInstance.processPayment(
        data.paymentMethodId,
        invoice.finalTotalPrice,
        user.email
      );
      // const paymentIntentId = uuidv4(); // uncomment to test without stripe

      // 5) Once Payment service confirms payment, payment service must confirm the transaction with the paymentIntentId
      const confirmedInvoice = await transactionService.confirmTransaction(invoice, orderItems, paymentIntentId, user.userId)

      await emailService.sendEmail(
        user.user.email,
        `Thank You for Your Purchase, ${user.firstName}! Your PetHub Order is Confirmed`,
        emailTemplate.checkoutSuccessEmail(
          user.firstName,
          confirmedInvoice,
          `http://localhost:3002/customer/orders`
        ),
        "invoice.pdf",
        invoice.attachmentURL
      );

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

