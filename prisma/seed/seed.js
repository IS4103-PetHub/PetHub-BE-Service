const { seedRBAC } = require("./rbac/rbac.js");
const { PrismaClient } = require("@prisma/client");
const { seedCommissionRule } = require("./finance/commissionRules.js");
const { seedPayout } = require("./finance/payout.js");
const { seedUser } = require("./user/user.js");
const { seedBusinessData } = require("./serviceListing/serviceListing.js");
const { seedCalendarGroup } = require("./calendarGroup/calendarGroup.js");
const { seedInvoicesAndOrders } = require("./orders/orders.js");
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
  console.log("Seeding invoices, order items and bookings...");
  await seedInvoicesAndOrders(prisma);
  console.log("Seeding payout invoices...");
  await seedPayout(prisma)
  await prisma.$disconnect(); // Disconnect from the database after seeding is done
  console.log("Main seeding completed!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
