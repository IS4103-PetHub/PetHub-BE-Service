const { AccountStatus, AccountType } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // bcrypt for password hashing

// PET BUSINESS SEED DATA
const petBusinesses = [
  {
    id: 1,
    email: "john.doe123231@example.com",
    password: "password1234",
    companyName: "John's Company",
    uen: "13213821312",
    contactNumber: "93727651",
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    password: "pass12345", // Updated to meet criteria
    companyName: "Smith's Pet Shop",
    uen: "987654321",
    contactNumber: "5551234",
  },
  {
    id: 3,
    email: "mike.petbiz@example.com",
    password: "secure1234", // Updated to meet criteria
    companyName: "Mike's Pet Business",
    uen: "1122334455",
    contactNumber: "12345678",
  },
  {
    id: 4,
    email: "susan.animalstore@example.com",
    password: "mypets123", // Updated to meet criteria
    companyName: "Susan's Animal Store",
    uen: "987654321",
    contactNumber: "98765432",
  },
  {
    id: 5,
    email: "petstore123@example.com",
    password: "pets12345", // Updated to meet criteria
    companyName: "PetStore123",
    uen: "9988776655",
    contactNumber: "99999999",
  },
];

async function seedUser(prisma) {
  for (const pb of petBusinesses) {
    await prisma.user.upsert({
      where: { userId: pb.id },
      update: {},
      create: {
        email: pb.email,
        password: await bcrypt.hash(pb.password, 10),
        accountType: AccountType.PET_BUSINESS,
        accountStatus: AccountStatus.ACTIVE,
        petBusiness: {
          create: {
            companyName: pb.companyName,
            uen: pb.uen,
            contactNumber: pb.contactNumber,
          },
        },
      },
    });
  }
}

module.exports = { petBusinesses, seedUser };
