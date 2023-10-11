require("dotenv").config();

// global instance
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // SERVICE FUNCTIONS
  
  async processPayment(paymentMethodId, amount, email, currency = 'SGD') {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method: paymentMethodId,
        confirm: true,
        receipt_email: email,
        return_url: "http://localhost:3000/payments" // TODO: discuss with FE what page to route to after payments
      });

      // TODO: Maybe save card after payment --> Tag to customer ID

      return paymentIntent.id;
    } catch (error) {
      throw new Error('Payment processing failed: ' + error.message);
    }
  }

  async issuePartialRefund(paymentIntentId, amount) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount,
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
      console.log(balance);
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  }
}

const stripeServiceInstance = new StripeService()
module.exports = stripeServiceInstance;
