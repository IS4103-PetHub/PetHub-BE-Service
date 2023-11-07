const { getRandomPastDate } = require("../../../src/utils/date");
const { v4: uuidv4 } = require("uuid");

const CURRENT_DATE = new Date();

// All function in this file tries not to use hard coded data, but data that was already created by previous seeding (AKA can already be found by our prisma instance)
// Hence even if other seed files change, this file should not break
async function seedPayout(prisma) {
  try {
    const pbIds = await getAllPetBusinessIds(prisma)
    const orderItemIds = await getOrderItemIds(prisma);
    // payoutInvoices in the last 30 days 
    await createPayoutInvoices(prisma, pbIds, orderItemIds, 30);
    // payoutInvoices in the last year
    await createPayoutInvoices(prisma, pbIds, orderItemIds, 365)

  } catch (error) {
    console.error("Error creating PayoutInvoice:", error);
  }
}

// Create 30 payout invoices within the last (dateRange) days
async function createPayoutInvoices(prisma, pbIds, orderItemIds, dateRange) {
  try {
    for (let i = 0; i < 30; i++) {
      const randomPBIndex = Math.floor(Math.random() * pbIds.length);
      const payoutAmount = await generateMockPayoutValues();
      await prisma.payoutInvoice.create({
        data: {
          totalAmount: payoutAmount.totalAmount,
          commissionCharge: payoutAmount.commissionCharge,
          paidOutAmount: payoutAmount.paidOutAmount,
          createdAt: getRandomPastDate(CURRENT_DATE, dateRange),
          paymentId: uuidv4(), // mock of the stripe payment id
          orderItems: {
            // NOTE: This is not the actual order items, it is a randomly generated list of orderitemIds from the existing orderItems
            // We need this list as we need the to aggregate the total order count per PB in each payout invoice for the revenue tracking service charts
            connect: selectRandomOrderItems(orderItemIds),
          },
          userId: pbIds[randomPBIndex],
        },
      });
    }
  } catch (error) {
    console.error("Error creating PayoutInvoice:", error);
  }
}


// UTILITY FUNCTIONS

// Return an integer list of all PB IDs
async function getAllPetBusinessIds(prisma) {
  try {
    const petBusinesses = await prisma.petBusiness.findMany({
      select: {
        userId: true,
      },
    });

    const userIds = petBusinesses.map((pb) => pb.userId);
    return userIds;
  } catch (error) {
    console.error("Error fetching user IDs of PetBusinesses:", error);
    throw new Error("Error fetching user IDs of PetBusinesses");
  }
}

// Return a list of all orderItem Ids, in the form [{orderItemId: 1}, {orderItemId: 2}, ...]
async function getOrderItemIds(prisma) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      select: {
        orderItemId: true,
      },
    });

    const orderItemIds = orderItems.map((item) => ({ orderItemId: item.orderItemId }));
    return orderItemIds;
  } catch (error) {
    console.error("Error fetching order items:", error);
    throw new Error("Error fetching order items");
  }
}

// From the list of orderItemIds: [{orderItemId: 1}, {orderItemId: 2}, ...]
// Select 1-5 random Ids from the list. This is to ensure random association of order items when mocking payout invoices
function selectRandomOrderItems(orderItemIds) {
  const randomItemCount = Math.floor(Math.random() * 5) + 1; // Select 1-5 random items
  const selectedItems = [];

  for (let i = 0; i < randomItemCount && i < orderItemIds.length; i++) {
    const randomIndex = Math.floor(Math.random() * orderItemIds.length);
    selectedItems.push(orderItemIds[randomIndex]);
    orderItemIds.splice(randomIndex, 1); // Remove the selected item from the list
  }

  return selectedItems;
}

function generateMockPayoutValues() {
    // Generate a random totalAmount between 5 and 120, divisible by 5
    const randomTotalAmount = Math.floor(Math.random() * 24 + 1) * 5;
  
    // Calculate commissionCharge as 7% of totalAmount
    const commissionCharge = parseFloat((randomTotalAmount * 0.07).toFixed(2));
  
    // Calculate paidOutAmount as totalAmount - commissionCharge
    const paidOutAmount = parseFloat((randomTotalAmount - commissionCharge).toFixed(2));
  
    return {
      totalAmount: randomTotalAmount,
      commissionCharge,
      paidOutAmount,
    };
  }

module.exports = { seedPayout };
