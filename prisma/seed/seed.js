const { seedRBAC } = require("./rbac/rbac.js");
const { PrismaClient } = require("@prisma/client");
const { seedCommissionRule } = require("./finance/commissionRules.js");
const { seedPayout } = require("./finance/payout.js");
const { seedUser } = require("./user/user.js");
const { seedBusinessData } = require("./serviceListing/serviceListing.js");
const { seedCalendarGroup } = require("./calendarGroup/calendarGroup.js");
const {
  seedInvoicesAndOrders,
  distributeOrderItems,
  countBrackets,
  seedBookings,
  seedFulfillment,
  seedRefunds,
  seedReviews,
} = require("./orders/orders.js");
const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log("Seeding commission rules...");
  await seedCommissionRule(prisma);
  console.log("Seeding users...");
  await seedUser(prisma);
  console.log("Seeding RBAC...");
  await seedRBAC(prisma); // Execute the RBAC seeding and pass the prisma instance
  console.log("Seeding calendar groups...");
  await seedCalendarGroup();
  console.log("Seeding business data...");
  await seedBusinessData(prisma);
  console.log("Seeding invoices and order items...");
  const orderItems = await seedInvoicesAndOrders(prisma);
  console.log("Seeding bookings for the above calendar groups...");
  const funPackUpdatedWithBooking = await seedBookings(prisma, orderItems);
  console.log("Seeding fulfilled orders (claim voucher)...");
  const funPackUpdatedWithFulfillment = await seedFulfillment(prisma, funPackUpdatedWithBooking);
  console.log("Seeding refunded orders...");
  const funPackUpdatedWithRefunds = await seedRefunds(prisma, funPackUpdatedWithFulfillment);
  console.log("Seeding reviewed orders...");
  const funPackUpdatedWithReviews = await seedReviews(prisma, funPackUpdatedWithRefunds);
  console.log("Seeding payout invoices...");
  await seedPayout(prisma);
  await prisma.$disconnect(); // Disconnect from the database after seeding is done
  console.log("Main seeding completed!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
