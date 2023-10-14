const OrderItemService = require("../../../src/api/services/finance/orderItemService");
const TransactionService = require("../../../src/api/services/finance/transactionService");
const petOwnerService = require("../../../src/api/services/user/petOwnerService");
const { v4: uuidv4 } = require("uuid");

// CHANGE THESE VALUES TO CHANGE HOW MUCH SEEDED DATA IS GENERATED. INVOICE PDFs WILL BE GENERATED TOO
const NUM_INVOICES = 5;
const NUM_CART_ITEMS = 4;

const JOHN_SERVICELISTING_IDS = [1, 2, 3, 4, 9, 10, 16];
const SL_PRICES_MAP = {
  1: 40,
  2: 60,
  3: 80,
  4: 75,
  9: 120,
  10: 20,
  16: 30,
};

// ============================== Helper functions ============================== //

// Get a random service listing ID belong to john's company
function getRandomSLIdFromJohn() {
  const randomIndex = Math.floor(Math.random() * JOHN_SERVICELISTING_IDS.length);
  return JOHN_SERVICELISTING_IDS[randomIndex];
}

// Get random quantity between 1 and 3 inclusive
function getRandomQuantity() {
  return Math.floor(Math.random() * 3) + 1;
}

// Calculate the total price from a list of cart items
function calculateTotalPrice(cartItems) {
  return cartItems.reduce((acc, item) => {
    return acc + SL_PRICES_MAP[item.serviceListingId] * item.quantity;
  }, 0);
}

// Create a cart item with a random SL and quantity
function createCartItem() {
  return {
    serviceListingId: getRandomSLIdFromJohn(),
    quantity: getRandomQuantity(),
  };
}

// Create checkout payloads to seed with x amount of cart items
function createCheckoutPayload(numCartItems) {
  const cartItems = Array.from({ length: numCartItems }, createCartItem);
  return {
    paymentMethodId: "pm_card_visa",
    totalPrice: calculateTotalPrice(cartItems),
    userId: 9,
    cartItems: cartItems,
  };
}

/*
    Simulate a checkout without stripe or emails. 
    This is because its easier to call the top level function rather than manually inserting via a prisma client (e.g. The need to generate invoice PDF manually etcetc)
*/
async function simulateCheckout(data) {
  const user = await petOwnerService.getUserById(data.userId);
  const { invoice, orderItems } = await TransactionService.buildTransaction(data.cartItems);
  if (invoice.totalPrice != data.totalPrice) {
    console.log(
      `Bad Request: amount specified (${data.totalPrice}) is incorrect; computed total: ${invoice.totalPrice}`
    );
  }
  const paymentIntentId = uuidv4();
  return await TransactionService.confirmTransaction(invoice, orderItems, paymentIntentId, user.userId); // returns invoice obj
}

// ============================== Helper functions ============================== //

// CREATE CHECKOUT SEED PAYLOADS
let checkoutPayloads = [];
for (let i = 0; i < NUM_INVOICES; i++) {
  checkoutPayloads.push(createCheckoutPayload(NUM_CART_ITEMS));
}

async function seedInvoicesAndOrders() {
  /*
    Save the original console.log and override it to do nothing,
    this is because we want to avoid bombing the terminal from the console.logs in the downstream functions
  */
  const originalLog = console.log;
  console.log = () => {};

  for (const [index, payload] of checkoutPayloads.entries()) {
    try {
      await simulateCheckout(payload);
    } catch (error) {
      console.log = originalLog; // Restore console.log so I can print the shortened log below
      console.log(`Error seeding invoices and orders for payload at index ${index}.`);
      console.log = () => {}; // Override console.log to do nothing again
    }
  }
  console.log = originalLog; // Restore console.log after the loop
}

module.exports = { seedInvoicesAndOrders };
