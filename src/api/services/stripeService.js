require("dotenv").config();
const CustomError = require("../errors/customError");

// global instance
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DEC_PLACE = 100

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // SERVICE FUNCTIONS

  async processPayment(paymentMethodId, amount, email, currency = 'SGD') {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * DEC_PLACE,
        currency: currency,
        payment_method: paymentMethodId,
        confirm: true,
        receipt_email: email,
        return_url: "http://localhost:3000/payments" // TODO: discuss with FE what page to route to after payments
      });

      if (!paymentIntent) throw new CustomError("Stripe: Unable to process payment", 500);
      // TODO: Maybe save card after payment --> Tag to customer ID

      return paymentIntent.id;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Stripe: Unknown payment processing failure: ' + error.message, 500);
    }
  }

  async issuePartialRefund(paymentIntentId, amount) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount * DEC_PLACE,
      });
      return refund;
    } catch (error) {
      throw new Error('Partial refund failed: ' + error.message);
    }
  }

  // UTILITY FUNCTIONS

  async checkBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      console.log(balance / DEC_PLACE);
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  }
}

const stripeServiceInstance = new StripeService()
module.exports = stripeServiceInstance;
