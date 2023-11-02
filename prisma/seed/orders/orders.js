const { OrderItemStatus } = require("@prisma/client");
const BookingService = require("../../../src/api/services/appointments/bookingService");
const TransactionService = require("../../../src/api/services/finance/transactionService");
const petOwnerService = require("../../../src/api/services/user/petOwnerService");
const { v4: uuidv4 } = require("uuid");
const CalendarGroupService = require("../../../src/api/services/appointments/calendarGroupService");
const { getRandomPastDate } = require("../../../src/utils/date");

// CHANGE THESE VALUES TO CHANGE HOW MUCH SEEDED DATA IS GENERATED. INVOICE PDFs WILL BE GENERATED TOO
const NUM_INVOICES = 20;
const NUM_CART_ITEMS = 3;
const CURRENT_DATE = new Date();

const JOHNS_SERVICELISTINGS = [
  {
    id: 1,
    duration: 60,
    price: 40,
    calendarGroup: 1,
    requiresBooking: true,
  },
  {
    id: 2,
    duration: 60,
    price: 60,
    calendarGroup: 4,
    requiresBooking: true,
  },
  {
    id: 3,
    duration: 60,
    price: 80,
    calendarGroup: 1,
    requiresBooking: true,
  },
  {
    id: 4,
    duration: 60,
    price: 75,
    calendarGroup: 3,
    requiresBooking: true,
  },
  {
    id: 8,
    duration: 60,
    price: 120,
    calendarGroup: 2,
    requiresBooking: true,
  },
  {
    id: 9,
    duration: 60,
    price: 20,
    calendarGroup: 3,
    requiresBooking: true,
  },
  {
    id: 10,
    duration: 180,
    price: 30,
    calendarGroup: 5,
    requiresBooking: true,
  },
  {
    id: 11,
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
  },
  {
    id: 12,
    defaultExpiryDays: 45,
    basePrice: 25.0,
    requiresBooking: false,
  },
  {
    id: 13,
    defaultExpiryDays: 30,
    basePrice: 18.0,
    requiresBooking: false,
  },
  {
    id: 14,
    defaultExpiryDays: 30,
    basePrice: 0.0,
    requiresBooking: false,
  },
  {
    id: 15,
    defaultExpiryDays: 30,
    basePrice: 20.0,
    requiresBooking: false,
  },
  {
    id: 16,
    defaultExpiryDays: 30,
    basePrice: 30.0,
    requiresBooking: false,
  },
  {
    id: 17,
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
  },
  {
    id: 18,
    defaultExpiryDays: 30,
    basePrice: 35.0,
    requiresBooking: false,
  },
  {
    id: 19,
    defaultExpiryDays: 30,
    basePrice: 25.0,
    requiresBooking: false,
  },
  {
    id: 20,
    defaultExpiryDays: 30,
    basePrice: 40.0,
    requiresBooking: false,
  },
  {
    id: 21,
    defaultExpiryDays: 30,
    basePrice: 35.0,
    requiresBooking: false,
  },
  {
    id: 22,
    defaultExpiryDays: 30,
    basePrice: 10.0,
    requiresBooking: false,
  },
  {
    id: 23,
    defaultExpiryDays: 30,
    basePrice: 45.0,
    requiresBooking: true,
  },
  {
    id: 24,
    defaultExpiryDays: 30,
    basePrice: 20.0,
    requiresBooking: false,
  },
  {
    id: 25,
    defaultExpiryDays: 30,
    basePrice: 50.0,
    requiresBooking: true,
  },
  {
    id: 26,
    defaultExpiryDays: 30,
    basePrice: 40.0,
    requiresBooking: false,
  },
  {
    id: 27,
    defaultExpiryDays: 30,
    basePrice: 25.0,
    requiresBooking: false,
  },
  {
    id: 28,
    defaultExpiryDays: 30,
    basePrice: 60.0,
    requiresBooking: true,
  },
  {
    id: 29,
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
  },
  {
    id: 30,
    defaultExpiryDays: 30,
    basePrice: 30.0,
    requiresBooking: true,
  },
  {
    id: 31,
    defaultExpiryDays: 30,
    basePrice: 35.0,
    requiresBooking: false,
  },
  {
    id: 32,
    defaultExpiryDays: 30,
    basePrice: 20.0,
    requiresBooking: false,
  },
  {
    id: 33,
    defaultExpiryDays: 30,
    basePrice: 45.0,
    requiresBooking: true,
  },
  {
    id: 34,
    defaultExpiryDays: 30,
    basePrice: 30.0,
    requiresBooking: false,
  },
  {
    id: 35,
    defaultExpiryDays: 30,
    basePrice: 40.0,
    requiresBooking: true,
  }
];

// ============================== Helper functions ============================== //

// Get a random service listing ID belong to john's company
function getRandomSLIdFromJohn() {
  const randomIndex = Math.floor(Math.random() * JOHNS_SERVICELISTINGS.length);
  return JOHNS_SERVICELISTINGS[randomIndex].id;
}

// Get random quantity between 1 and 3 inclusive
function getRandomQuantity() {
  return Math.floor(Math.random() * 3) + 1;
}

// Calculate the total price from a list of cart items
function calculateTotalPrice(cartItems) {
  return cartItems.reduce((acc, item) => {
    const serviceListing = JOHNS_SERVICELISTINGS.find((listing) => listing.id === item.serviceListingId);

    if (serviceListing) {
      return acc + serviceListing.price * item.quantity;
    } else {
      return acc; // Handle the case where a service listing is not found, should not happen
    }
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
async function simulateCheckout(data, lastMonth = false) {
  const user = await petOwnerService.getUserById(data.userId);
  const { invoice, orderItems } = await TransactionService.buildTransaction(data.cartItems);
  const paymentIntentId = uuidv4();
  if (lastMonth) {
    // Seed data within the past month for dashboarding and analysis (featured listings) purposes
    invoice.createdAt = getRandomPastDate(CURRENT_DATE, 30);
  } else {
    // Seed data within the past year
    invoice.createdAt = getRandomPastDate(CURRENT_DATE, 365); 
  }  
  return await TransactionService.confirmTransaction(invoice, orderItems, paymentIntentId, user.userId); // returns invoice obj
}

// ============================== Helper functions ============================== //

// CREATE CHECKOUT SEED PAYLOADS
let checkoutPayloads = [];
for (let i = 0; i < NUM_INVOICES; i++) {
  checkoutPayloads.push(createCheckoutPayload(NUM_CART_ITEMS));
}

async function seedInvoicesAndOrders(prisma) {
  /*
    Save the original console.log and override it to do nothing,
    this is because we want to avoid bombing the terminal from the console.logs in the downstream functions
  */
  let orderItems = [];

  const originalLog = console.log;
  console.log = () => {};

  for (const [index, payload] of checkoutPayloads.entries()) {
    try {
      const confirmedInvoice = await simulateCheckout(payload);
      const confirmedInvoiceLastMonth = await simulateCheckout(payload, true);
      orderItems.push(confirmedInvoice.orderItems);
      orderItems.push(confirmedInvoiceLastMonth.orderItems)
    } catch (error) {
      console.log = originalLog; // Restore console.log so I can print the shortened log below
      console.log(`Error seeding invoices and orders for payload at index ${index}.`);
      console.log = () => {}; // Override console.log to do nothing again
    }
  }
  console.log = originalLog; // Restore console.log after the loop

  await diversityOrderItemStatuses(prisma, orderItems.flat());
}

/*
  YES THIS ENTIRE FUNCTION IS A MESS BUT
*/
async function diversityOrderItemStatuses(prisma, orderItems) {
  let pendingBookingItems = orderItems.filter((item) => item.status === "PENDING_BOOKING");
  let pendingFulfillmentItems = orderItems
    .filter((item) => item.status === "PENDING_FULFILLMENT")
    .slice(0, 12); // get 12 out that do not require booking

  // Expire and refund one item each that requires booking
  const expiredItem = pendingBookingItems.shift();
  if (expiredItem) {
    try {
      await prisma.orderItem.update({
        where: {
          orderItemId: expiredItem.orderItemId,
        },
        data: {
          status: OrderItemStatus.EXPIRED,
          dateFulfilled: new Date(),
        },
      });
    } catch (error) {
      console.log("ERROR SETTING EXPIRED STATUS", error);
    }
  }
  const refundedItem = pendingBookingItems.shift();

  if (refundedItem) {
    try {
      await prisma.orderItem.update({
        where: {
          orderItemId: refundedItem.orderItemId,
        },
        data: {
          status: OrderItemStatus.REFUNDED,
        },
      });
    } catch (error) {
      console.log("ERROR SETTING REFUNDED STATUS", error);
    }
  }

  let pendingFulfillmentAndRequireBookings = [];

  for (const item of pendingBookingItems) {
    if ([4, 8, 9].includes(item.serviceListingId)) {
      const serviceListing = JOHNS_SERVICELISTINGS.find((listing) => listing.id === item.serviceListingId);

      // GET AVAILABLE TIME SLOTS FROM THE NEXT TWO WEEKS
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 14);
      const availalbeTimeSlot = await CalendarGroupService.getAvailability(
        item.orderItemId,
        null,
        currentDate,
        endDate,
        serviceListing.duration
      );

      // Use the random index to get the selected time slot
      const randomIndex = Math.floor(Math.random() * availalbeTimeSlot.length);
      const selectedTimeSlot = availalbeTimeSlot[randomIndex];
      if (!selectedTimeSlot) continue;

      try {
        await BookingService.createBooking(
          9,
          serviceListing.calendarGroup,
          item.orderItemId,
          selectedTimeSlot.startTime,
          selectedTimeSlot.endTime
        );
        pendingFulfillmentAndRequireBookings.push(item);
      } catch (error) {
        console.log("TIME SLOT", selectedTimeSlot);
        console.log("ERROR WHEN CREATING BOOKINGS", error);
      }
      // break
    }
  }

  const statusUpdates = [
    // { start: 0, end: 1, status: OrderItemStatus.PAID_OUT },
    { start: 0, end: 1, status: OrderItemStatus.FULFILLED },
    { start: 1, end: 2, status: OrderItemStatus.REFUNDED },
    { start: 2, end: 3, status: OrderItemStatus.EXPIRED },
  ];

  for (const update of statusUpdates) {
    for (let i = update.start; i < update.end; i++) {
      try {
        // Diversify statuses of those that are pending fulfillment but do not required booking
        await prisma.orderItem.update({
          where: {
            orderItemId: pendingFulfillmentItems[i].orderItemId,
          },
          data: {
            status: update.status,
            ...(update.status !== OrderItemStatus.EXPIRED ? { dateFulfilled: new Date() } : {}), // If fulfilled or refunded, pretend to have redeemed the voucher
          },
        });
        // Diversify statuses of those that are pending fulfillment and require booking
        await prisma.orderItem.update({
          where: {
            orderItemId: pendingFulfillmentAndRequireBookings[i].orderItemId,
          },
          data: {
            status: update.status,
            ...(update.status !== OrderItemStatus.EXPIRED ? { dateFulfilled: new Date() } : {}), // If fulfilled or refunded, pretend to have redeemed the voucher
          },
        });
      } catch (error) {
        console.log("ERROR SEEDING UPDATING STATUS", error);
        console.log("pendingFulfillmentItems", pendingFulfillmentItems[i]);
      }
    }
  }
}

module.exports = { seedInvoicesAndOrders };
