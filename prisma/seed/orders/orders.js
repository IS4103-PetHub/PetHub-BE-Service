const { OrderItemStatus, RefundStatus } = require("@prisma/client");
const BookingService = require("../../../src/api/services/appointments/bookingService");
const TransactionService = require("../../../src/api/services/finance/transactionService");
const petOwnerService = require("../../../src/api/services/user/petOwnerService");
const { v4: uuidv4 } = require("uuid");
const CalendarGroupService = require("../../../src/api/services/appointments/calendarGroupService");
const { getRandomPastDate } = require("../../../src/utils/date");
const refundRequestService = require("../../../src/api/services/finance/refundRequestService");
const reviewService = require("../../../src/api/services/serviceListing/reviewService");
const s3ServiceInstance = require("../../../src/api/services/s3Service");
const serviceListingService = require("../../../src/api/services/serviceListing/serviceListingService");
const { remoteImageUrlToFile, getRandomImageURLs, mapCategoryToURLs, serviceListings } = require("../serviceListing/serviceListing");

// CHANGE THESE VALUES TO CHANGE HOW MUCH SEEDED DATA IS GENERATED. INVOICE PDFs WILL BE GENERATED TOO
const NUM_INVOICES = 60;
const NUM_CART_ITEMS = 3;
const CURRENT_DATE = new Date();
const NUM_VOUCHERS_TO_CLAIM = 400; //fulfilled orders
const NUM_REVIEWS = 200;
const NUM_PENDING_REFUNDS = 5;
const NUM_EXPIRED = 15;

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

  // assumes pointsRedeemed is 
  const pointsRedeemed = 0
  invoice.finalMiscCharge = invoice.miscCharge - (pointsRedeemed / 100)
  invoice.pointsRedeemed = pointsRedeemed
  invoice.finalTotalPrice = invoice.totalPrice + invoice.finalMiscCharge

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

// Helper function to get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomRating = () => {
  const ratings = [1, 2, 3, 4, 4, 4, 5, 5, 5, 5]; // Higher chances for 4 and 5s LOL
  return getRandomElement(ratings);
};

// Sample data for titles, comments, and image URLs
// review rating : [title, comment, pb reply]
const reviewVariations = new Map([
  [1, [
    ["Not Satisfied", "Expected more from this product", "We're sorry to hear about your experience. Please reach out to our support team so we can assist you further."],
    ["Could be better", "Not worth the price", "We apologize for any inconvenience caused. Your feedback helps us improve."],
    ["Not as advertised", "The product didn't match the description provided. Disappointing experience overall.", "We're disappointed to hear this. Your satisfaction is important to us; please contact us for assistance."]
  ]],
  [2, [
    ["Disappointed", "Expected more from this product", "We're disappointed to hear this. Your satisfaction is important to us; please contact us for assistance."],
    ["Alright", "Meh, it's alright I guess", "We're sorry the product didn't meet your expectations. Please contact us so we can make it right."],
    ["Needs improvement", "There are a few areas that could use some enhancement, especially in terms of quality and time spent on it.", "We appreciate your feedback! We're constantly working on improving our products and services."]
  ]],
  [3, [
    ["Surpassed my expectations", "Absolutely thrilled with my purchase! It's rare to find something that exceeds expectations.", "It's wonderful to hear that our product surpassed your expectations! Thank you for sharing your experience."],
    ["Fantastic purchase", "I was skeptical at first, but this product blew me away with its performance.", "We're delighted to know that our product made your purchase fantastic! Thank you for choosing us."],
    ["This item has exceeded by expectations", "I recently purchased this, and I have to say, it has been a game-changer for my little Beagle, Benny! From the moment I unwrapped it, Benny was drawn to it that just molds around his body. It's been a couple of weeks now, and Benny has never looked so peaceful. I've noticed he's more energetic during our walks, and I'm convinced it's because he's getting quality rest. The bed has held up beautifully despite Benny's occasional digging ritual before he settles down. It's been through the wash a few times and has maintained its shape and softness, which honestly has surprised me, considering how many beds we've gone through before.", "We're thrilled to hear that our product has met your expectations! Thank you for your kind words."]
  ]],
  [4, [
    ["Great quality!", "The stitching and material used are top-notch. Very impressed with the overall quality.", "Thank you for appreciating the quality of our product! We're dedicated to providing top-notch items."],
    ["Impressed with durability", "This product has proven its durability even after repeated use.", "We're glad to hear that our product's durability has impressed you! Your satisfaction motivates us."],
    ["Stylish and functional", "Not only is this product functional, but it also adds a stylish touch to my pet's space.", "We're happy to hear that our product adds both functionality and style! Thank you for your feedback."]
  ]],
  [5, [
    ["Exceeded expectations!", "My pet loves it! It's a hit from day one.", "We're thrilled to hear that our product is a hit with your pet! Thank you for sharing."],
    ["Exceptional comfort", "Unmatched comfort for my furry friend. A must-buy!", "We're delighted to provide unmatched comfort for your furry friend! Thank you for choosing us."],
    ["Perfect purchase", "Exactly what I was looking for. Couldn't be happier.", "We're glad our product met your expectations! Thank you for your kind words."]
  ]],
]);

const getRandomTupleForRating = (rating) => {
  const tuples = reviewVariations.get(rating);
  if (tuples) {
    return tuples[Math.floor(Math.random() * tuples.length)];
  }
  return null; 
};

const reviewImages = [
  {
    url: "https://i.insider.com/5d289d6921a86120285e5e24?width=700",
    name: "dog_review_1",
  },
  {
    url: "https://www.vetmed.com.au/wp-content/uploads/2019/03/How-to-Choose-Right-Vet-Clinic-for-Your-Multi-Breeds-Pets.jpg",
    name: "dog_review_2",
  },
  {
    url: "https://img1.wsimg.com/isteam/ip/3b648486-0d2e-4fcd-8deb-ddb6ce935eb3/blob-0010.png",
    name: "dog_review_3",
  },
];

const getRandomReviewImages = () => {
  const numberOfImages = Math.floor(Math.random() * 4); // 0 to 3 images
  const selectedImages = [];
  for (let i = 0; i < numberOfImages; i++) {
    selectedImages.push(getRandomElement(reviewImages));
  }
  return selectedImages;
};

async function simulateCreateReview(prisma, payload, orderItem) {
  try {
    if (orderItem.status !== OrderItemStatus.FULFILLED) console.log("WARNING: Order item is not fulfilled");
    if (!orderItem.dateFulfilled) console.log("WARNING: Order item does not have a dateFulfilled");

    // Simulate the date of review creation as 3 days after the order fulfillment
    let simulatedDateCreated = new Date(orderItem.dateFulfilled);
    simulatedDateCreated.setDate(simulatedDateCreated.getDate() + 3);

    // If simulatedDateCreated is in the future, set it to the current date
    if (simulatedDateCreated.getTime() > CURRENT_DATE.getTime()) {
      simulatedDateCreated = CURRENT_DATE;
    }

    const serviceListingId = orderItem.serviceListingId;
    const serviceListing = await serviceListingService.getServiceListingById(serviceListingId);
    
    let key = [];
    let url = [];

    if (Math.random() < 0.5) { // 50% chance of a review having image
      const listingData = serviceListings.find( (item) => item.id === serviceListingId );
      const imageForReview = getRandomImageURLs(listingData.urlFiles);

      const images = [];
      for (const imageURL of imageForReview) {
        const file = await remoteImageUrlToFile(imageURL, uuidv4);
        images.push(file);
      }

      key = await s3ServiceInstance.uploadImgFiles(images, "review");
      url = await s3ServiceInstance.getObjectSignedUrl(key);
    }

    let newRating;
    if (serviceListing.reviews.length != 0 && serviceListing.overallRating != 0) {
      const currentTotalRating = serviceListing.reviews.length * serviceListing.overallRating;
      newRating = (currentTotalRating + Number(payload.rating)) / (serviceListing.reviews.length + 1);
    } else {
      newRating = Number(payload.rating);
    }

    const simulatedReview = await prisma.review.create({
      data: {
        title: payload.title,
        comment: payload.comment,
        rating: payload.rating,
        attachmentURLs: url,
        attachmentKeys: key,
        orderItemId: orderItem.orderItemId,
        serviceListingId: orderItem.serviceListingId,
        dateCreated: simulatedDateCreated,
        likedBy: { // Connect random number of users (between 0 and 8) with userID between 9 and 17
          connect: Array.from({ length: Math.floor(Math.random() * 9) }, () => ({
            userId: Math.floor(Math.random() * (17 - 9 + 1)) + 9,
          })),
        },
      },
    });

    await prisma.serviceListing.update({
      where: { serviceListingId },
      data: {
        overallRating: newRating,
      },
    });

    return simulatedReview;
  } catch (error) {
    console.error("Failed to simulate review creation:", error);
  }
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
  // countBrackets(orderItemVarietyFunPack);
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
  // countBrackets(orderItemVarietyFunPack);
  return orderItemVarietyFunPack;
}

function countBrackets(orderItemVarietyFunPack) {
  console.log("\nCounting brackets...\n");
  for (const status in orderItemVarietyFunPack) {
    if (orderItemVarietyFunPack.hasOwnProperty(status)) {
      const count = orderItemVarietyFunPack[status].length;
      console.log(`${status}: ${count} item(s)`);
    }
  }
  console.log("\nEnd Count\n");
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
  console.log = () => { };

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
      console.log = () => { }; // Override console.log to do nothing again
    }
  }
  console.log = originalLog; // Restore console.log after the loop

  return orderItems.flat();
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
        const booking = await BookingService.createBooking(
          9,
          serviceListing.calendarGroup,
          item.orderItemId,
          selectedTimeSlot.startTime,
          selectedTimeSlot.endTime
        );
        // update local state
        item.status = OrderItemStatus.PENDING_FULFILLMENT;
        item.booking = booking;
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

  for (let i = 0; i < Math.min(NUM_VOUCHERS_TO_CLAIM, pendingFulfillmentItems.length); i++) {
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
      // update local state
      item.status = OrderItemStatus.FULFILLED;
      item.dateFulfilled = item.invoice.createdAt;
    } catch (error) {
      console.error(`Error fulfilling order item`, error);
    }
  }

  // Update the variety fun pack
  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

async function seedRefunds(prisma, funPack) {
  let orderItemVarietyFunPack = funPack;

  const itemsForRefund = orderItemVarietyFunPack.pendingFulfillment.slice(0, NUM_PENDING_REFUNDS);
  const reasons =
    "I recently purchased the Deluxe Pet Bed for my senior Labrador, " +
    "and it did not meet our expectations. The fabric tore within a week, " +
    "the zipper broke, the bed lost its shape, making my dog uncomfortable. " +
    "I would like to request a full refund due to these flaws.";

  let refundRequestIds = [];
  const currentDate = new Date();

  try {
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
      // update local state
      item.RefundRequest = refundRequest;
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
        orderItemVarietyFunPack.refunded.push(itemToApprove);
      }
    }

    // Reject the refund for the second item and update status locally
    if (refundRequestIds.length > 1) {
      const rejectionResponse = await refundRequestService.rejectRefundRequest(refundRequestIds[1], {
        comment: "Rejected refund request due to policy constraints.",
      });
    }
  } catch (error) {
    console.error(`Error seeding refunds`, error);
  }

  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

async function seedReviews(prisma, funPack) {
  const orderItemVarietyFunPack = funPack;

  const itemsForReview = orderItemVarietyFunPack.fulfilled.slice(0, NUM_REVIEWS);

  for (const item of itemsForReview) {
    const rating = getRandomRating();
    const [title, comment, pbReply] = getRandomTupleForRating(rating);

    const payload = {
      title: title,
      comment: comment,
      rating,
    };

    try {
      // Skip the time checks and just create the review (3 days after each item's fulfillment date)
      const newReview = await simulateCreateReview(prisma, payload, item);
      // update local state
      item.review = newReview;

      // 50% chance for a reply
      if (Math.random() < 0.5) {
        const updatedReview = await prisma.review.update({
          where: { reviewId: newReview.reviewId },
          data: {
            reply: pbReply,
            replyDate: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  // print info on review aggregation
  try {
    const topReviewedServiceListings = await prisma.review.groupBy({
      by: ["serviceListingId"],
      _count: {
        serviceListingId: true,
      },
      orderBy: {
        _count: {
          serviceListingId: "desc",
        },
      },
      take: 3,
    });

    const topServiceListingsWithDetails = await Promise.all(
      topReviewedServiceListings.map(async (listing) => {
        const serviceListing = await prisma.serviceListing.findUnique({
          where: { serviceListingId: listing.serviceListingId },
          select: {
            title: true,
            petBusiness: {
              select: {
                companyName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        });

        return {
          title: serviceListing.title,
          petBusinessName: serviceListing.petBusiness.companyName,
          petBusinessEmail: serviceListing.petBusiness.user.email,
          reviewsCount: listing._count.serviceListingId,
        };
      })
    );

    console.log("Top 3 most reviewed service listings:");
    topServiceListingsWithDetails.forEach((listing, index) => {
      console.log(
        `${index + 1}: ${listing.title} by: ${listing.petBusinessName} with email: ${
          listing.petBusinessEmail
        } - Review Count: ${listing.reviewsCount}`
      );
    });
  } catch (error) {
    console.error("Failed to aggregate top reviewed service listings:", error);
  }

  return validateAndDistributeOrderItems(orderItemVarietyFunPack);
}

async function seedExpired(prisma, funPack) {
  let orderItemVarietyFunPack = funPack;

  const itemsToExpire = orderItemVarietyFunPack.pendingFulfillment.slice(0, NUM_EXPIRED);
  const currentDate = new Date();
  try {
    for (const item of itemsToExpire) {
      // Update the DB
      await prisma.orderItem.update({
        where: { orderItemId: item.orderItemId },
        data: { 
          expiryDate: currentDate,
          status: OrderItemStatus.EXPIRED, 
        },
      });
      orderItemVarietyFunPack.expired.push(item);
    }
  } catch (error) {
    console.error(`Error seeding expired order items`, error);
  }

  // print log of overview of all orderItems
  countBrackets(orderItemVarietyFunPack);
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
  seedExpired,
};
