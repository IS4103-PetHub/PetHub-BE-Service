const { seedRBAC } = require("./rbac/rbac.js");
const { PrismaClient } = require("@prisma/client");
const { seedUser } = require("./user/user.js");
const { seedBusinessData } = require("./serviceListing/serviceListing.js");
const { seedCalendarGroup, seedBookings } = require("./calendarGroup/calendarGroup.js");
const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log("Seeding users...");
  await seedUser(prisma);
  console.log("Seeding RBAC...");
  await seedRBAC(prisma); // Execute the RBAC seeding and pass the prisma instance
  console.log("Seeding calendar groups...");
  await seedCalendarGroup();
  console.log("Seeding business data...");
  await seedBusinessData(prisma);
  console.log("Seeding bookings for the above calendar groups...");
  await seedBookings();
  console.log("Main seeding completed!");
  await prisma.$disconnect(); // Disconnect from the database after seeding is done
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
