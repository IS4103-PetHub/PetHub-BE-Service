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
        amount: this.dollarToCents(amount),
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
        amount: this.dollarToCents(amount),
      });
      return refund;
    } catch (error) {
      throw new Error('Partial refund failed: ' + error.message);
    }
  }

  // UTILITY FUNCTIONS

  dollarToCents(amount = 0.00) {
    // First, round the amount to the nearest 2 decimal places (i.e., to the nearest cent)
    const roundedAmount = Math.round(amount * DEC_PLACE) / DEC_PLACE;

    // Now, convert dollars to cents by multiplying by 100
    // Since we've already rounded to the nearest cent, this should always give a whole number
    return Math.round(roundedAmount * DEC_PLACE);
  }

  centsToDollar(cents = 0) {
    return cents / DEC_PLACE
  }

  async checkBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      console.log(this.centsToDollar(balance));
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  }
}

const stripeServiceInstance = new StripeService()
module.exports = stripeServiceInstance;
