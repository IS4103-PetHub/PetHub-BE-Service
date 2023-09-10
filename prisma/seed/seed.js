const { seedRBAC } = require('./rbac/rbac.js');
const { PrismaClient } = require('@prisma/client');
const { seedUser } = require('./user/user.js');
const { seedBusinessData } = require('./serviceListing/serviceListing.js');
const prisma = new PrismaClient();

async function main() {
    await prisma.$connect();
    await seedUser(prisma);
    await seedBusinessData(prisma);
    await seedRBAC(prisma);  // Execute the RBAC seeding and pass the prisma instance
    console.log('Main seeding completed!');
    await prisma.$disconnect();  // Disconnect from the database after seeding is done
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
