const { OrderItemStatus, RefundStatus } = require("@prisma/client");
const BookingService = require("../../../src/api/services/appointments/bookingService");
const TransactionService = require("../../../src/api/services/finance/transactionService");
const RefundRequestService = require("../../../src/api/services/finance/refundRequestService");
const petOwnerService = require("../../../src/api/services/user/petOwnerService");
const { v4: uuidv4 } = require("uuid");
const CalendarGroupService = require("../../../src/api/services/appointments/calendarGroupService");
const { getRandomPastDate } = require("../../../src/utils/date");
const refundRequestService = require("../../../src/api/services/finance/refundRequestService");

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
  },
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

      // Include invoice to OI but remove circular ref
      const addInvoiceToOrderItems = (orderItems, invoice) => {
        return orderItems.map((item) => {
          return {
            ...item,
            invoice: {
              ...invoice,
              orderItems: undefined,
            },
          };
        });
      };

      orderItems.push(...addInvoiceToOrderItems(confirmedInvoice.orderItems, confirmedInvoice));
      orderItems.push(
        ...addInvoiceToOrderItems(confirmedInvoiceLastMonth.orderItems, confirmedInvoiceLastMonth)
      );
    } catch (error) {
      console.log = originalLog; // Restore console.log so I can print the shortened log below
      console.log(`Error seeding invoices and orders for payload at index ${index}.`);
      console.log = () => {}; // Override console.log to do nothing again
    }
  }
  console.log = originalLog; // Restore console.log after the loop

  return orderItems.flat();
}

function distributeOrderItems(orderItems) {
  const orderItemVarietyFunPack = {
    pendingBooking: [],
    pendingFulfillment: [],
    fulfilled: [],
    paidOut: [],
    refunded: [],
    expired: [],
  };

  for (const item of orderItems) {
    switch (item.status) {
      case OrderItemStatus.PENDING_BOOKING:
        orderItemVarietyFunPack.pendingBooking.push(item);
        break;
      case OrderItemStatus.PENDING_FULFILLMENT:
        orderItemVarietyFunPack.pendingFulfillment.push(item);
        break;
      case OrderItemStatus.FULFILLED:
        orderItemVarietyFunPack.fulfilled.push(item);
        break;
      case OrderItemStatus.PAID_OUT:
        orderItemVarietyFunPack.paidOut.push(item);
        break;
      case OrderItemStatus.REFUNDED:
        orderItemVarietyFunPack.refunded.push(item);
        break;
      case OrderItemStatus.EXPIRED:
        orderItemVarietyFunPack.expired.push(item);
        break;
      default:
        break;
    }
  }
  countBrackets(orderItemVarietyFunPack);
  return orderItemVarietyFunPack;
}

function validateAndDistributeOrderItems(orderItemVarietyFunPack) {
  let itemsToReallocate = {
    pendingBooking: [],
    pendingFulfillment: [],
    fulfilled: [],
    paidOut: [],
    refunded: [],
    expired: [],
  };

  function findCorrectKeyForStatus(status) {
    switch (status) {
      case OrderItemStatus.PENDING_BOOKING:
        return "pendingBooking";
      case OrderItemStatus.PENDING_FULFILLMENT:
        return "pendingFulfillment";
      case OrderItemStatus.FULFILLED:
        return "fulfilled";
      case OrderItemStatus.PAID_OUT:
        return "paidOut";
      case OrderItemStatus.REFUNDED:
        return "refunded";
      case OrderItemStatus.EXPIRED:
        return "expired";
      default:
        return null;
    }
  }

  for (const statusKey in orderItemVarietyFunPack) {
    if (orderItemVarietyFunPack.hasOwnProperty(statusKey)) {
      // Filter out items that don't match  key and store them in the temporary map
      orderItemVarietyFunPack[statusKey] = orderItemVarietyFunPack[statusKey].filter((item) => {
        const correctKey = findCorrectKeyForStatus(item.status);
        if (correctKey !== statusKey) {
          itemsToReallocate[correctKey].push(item);
          return false;
        }
        return true;
      });
    }
  }

  for (const statusKey in itemsToReallocate) {
    if (itemsToReallocate.hasOwnProperty(statusKey)) {
      orderItemVarietyFunPack[statusKey].push(...itemsToReallocate[statusKey]);
    }
  }
  countBrackets(orderItemVarietyFunPack);
  return orderItemVarietyFunPack;
}

function countBrackets(orderItemVarietyFunPack) {
  console.log("\nCounting brackets...");
  for (const status in orderItemVarietyFunPack) {
    if (orderItemVarietyFunPack.hasOwnProperty(status)) {
      const count = orderItemVarietyFunPack[status].length;
      console.log(`${status}: ${count} item(s)`);
    }
  }
}

async function seedBookings(prisma, orderItems) {
  // Distribute order items into different status brackets
  let orderItemVarietyFunPack = distributeOrderItems(orderItems);

  // Make bookings for OIs with SLs 4, 8, and 9
  const pendingBookingItems = orderItemVarietyFunPack.pendingBooking;
  for (const item of pendingBookingItems) {
    if ([4, 8, 9].includes(item.serviceListingId)) {
      const serviceListing = JOHNS_SERVICELISTINGS.find((listing) => listing.id === item.serviceListingId);

      // Get available slots for the next 2 weeks
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 14);
      const availableTimeSlot = await CalendarGroupService.getAvailability(
        item.orderItemId,
        null,
        currentDate,
        endDate,
        serviceListing.duration
      );

      // Get a random timeslot
      const randomIndex = Math.floor(Math.random() * availableTimeSlot.length);
      const selectedTimeSlot = availableTimeSlot[randomIndex];
      if (!selectedTimeSlot) continue;

      try {
        await BookingService.createBooking(
          9,
          serviceListing.calendarGroup,
          item.orderItemId,
          selectedTimeSlot.startTime,
          selectedTimeSlot.endTime
        );
        item.status = OrderItemStatus.PENDING_FULFILLMENT; // Update the status only of the order item locally
      } catch (error) {
        console.log("Error creating booking", error);
      }
    }
  }

  // Update the variety fun pack
  return distributeOrderItems(orderItems);
}

async function seedFulfillment(prisma, funPack) {
  // Distribute order items into different status brackets
  let orderItemVarietyFunPack = funPack;

  const pendingFulfillmentItems = orderItemVarietyFunPack.pendingFulfillment;
  const maxFulfillmentCount = 30;

  for (let i = 0; i < Math.min(maxFulfillmentCount, pendingFulfillmentItems.length); i++) {
    try {
      const item = pendingFulfillmentItems[i];
      await prisma.orderItem.update({
        where: {
          orderItemId: item.orderItemId,
        },
        data: {
          status: OrderItemStatus.FULFILLED,
          dateFulfilled: item.invoice.createdAt,
        },
      });
      item.status = OrderItemStatus.FULFILLED; // Update the status only of the order item locally
    } catch (error) {
      console.error(`Error fulfilling order item`, error);
    }
  }

  // Update the variety fun pack
  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

async function seedRefunds(prisma, funPack) {
  let orderItemVarietyFunPack = funPack;

  // 5 items only
  const itemsForRefund = orderItemVarietyFunPack.pendingFulfillment.slice(0, 5);
  const reasons =
    "I recently purchased the Deluxe Pet Bed for my senior Labrador, " +
    "and it did not meet our expectations. The fabric tore within a week, " +
    "the zipper broke, the bed lost its shape, making my dog uncomfortable. " +
    "I would like to request a full refund due to these flaws.";

  let refundRequestIds = [];
  const currentDate = new Date();

  for (const item of itemsForRefund) {
    // Set dateFulfilled such that it falls within the allowed holding period
    const dateFulfilledWithinHoldingPeriod = new Date();
    dateFulfilledWithinHoldingPeriod.setDate(currentDate.getDate() - 8);
    item.dateFulfilled = dateFulfilledWithinHoldingPeriod;

    // Update the DB
    await prisma.orderItem.update({
      where: { orderItemId: item.orderItemId },
      data: { dateFulfilled: item.dateFulfilled },
    });

    const refundRequest = await refundRequestService.createRefundRequest({
      orderItemId: item.orderItemId,
      reason: reasons,
    });
    refundRequestIds.push(refundRequest.refundRequestId);
  }

  // Approve the refund for the first item and update status locally
  if (refundRequestIds.length > 0) {
    // approve without the service to avoid the stripe stuff
    approvalResponse = await prisma.refundRequest.update({
      where: {
        refundRequestId: refundRequestIds[0],
      },
      data: {
        status: RefundStatus.APPROVED,
        comment: "Approved as the reason given is valid.",
        processedAt: new Date(),
      },
    });
    await prisma.orderItem.update({
      where: {
        orderItemId: approvalResponse.orderItemId,
      },
      data: {
        status: OrderItemStatus.REFUNDED,
      },
    });
    let itemToApprove = itemsForRefund.find((item) => item.orderItemId === approvalResponse.orderItemId);
    if (itemToApprove) {
      itemToApprove.status = OrderItemStatus.REFUNDED;
    }
  }

  // Reject the refund for the second item and update status locally
  if (refundRequestIds.length > 1) {
    const rejectionResponse = await refundRequestService.rejectRefundRequest(refundRequestIds[1], {
      comment: "Rejected refund request due to policy constraints.",
    });
  }

  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

async function seedReviews(prisma, funPack) {
  let orderItemVarietyFunPack = funPack;

  // 20 items for now, later go and increase the number of invoices and IOs, increase fulfilled orders, then can increase this also
  const itemsForRefund = orderItemVarietyFunPack.pendingFulfillment.slice(0, 20);

  // create here (some got image some no image, diff titles and comment, some got reply some no reply, some got likes some no likes)

  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

module.exports = {
  seedInvoicesAndOrders,
  distributeOrderItems,
  countBrackets,
  seedBookings,
  seedFulfillment,
  seedRefunds,
  seedReviews,
};
