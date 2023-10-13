const prisma = require("../../../prisma/prisma");
const CustomError = require("../errors/customError");
const PaymentError = require("../errors/paymentError");
const stripeServiceInstance = require("./stripeService.js");


exports.checkout = async (data) => {
  try {
    // get user data and verify that this is a petOwner
    const user = await prisma.user.findUnique({
      where: { userId: data.userId },
    });
    if (!user || user.accountType != "PET_OWNER") {
      throw new CustomError(
        "User not found, or id is not tagged to a valid pet owner user account",
        404
      );
    }

    // complete stripe payment
    const paymentIntentId = await stripeServiceInstance.processPayment(
      data.paymentMethodId,
      data.amount,
      user.email
    );
    if (!paymentIntentId) {
      throw new CustomError("Payment processing failed", 404);
    }

    // TODO: create invoice using orderAndInvoiceService
    // const itemCount = data.itemCount
    // const cartItems = data.cartItems

    // TODO: create order items using orderAndInvoiceService and attach to invoice's orderItems

    // TODO: Return list of order items to FE for rendering
    return paymentIntentId;
  } catch (error) {
    console.error("Error during checkout:", error);
    if (error instanceof CustomError) throw error;
    throw new PaymentError(error);
  }
};

// supports partial and full refund
exports.refund = async (data) => {
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

