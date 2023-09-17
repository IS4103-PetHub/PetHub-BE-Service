const { AccountStatus, AccountType } = require("@prisma/client");
const bcrypt = require("bcryptjs"); // bcrypt for password hashing

// ADDRESS SEED DATA
const addresses = [
  {
    id: 1,
    addressName: "Riverfront Residence",
    line1: "123 Main Street",
    postalCode: "12345",
  },
  {
    id: 2,
    addressName: "Greenwood Gardens",
    line1: "456 Elm Avenue",
    postalCode: "67890",
  },
  {
    id: 3,
    addressName: "Oakwood Heights",
    line1: "789 Oak Road",
    postalCode: "54321",
  },
  {
    id: 4,
    addressName: "Maplewood Manor",
    line1: "101 Maple Lane",
    postalCode: "98765",
  },
  {
    id: 5,
    addressName: "Pineview Estates",
    line1: "222 Pine Street",
    postalCode: "24680",
  },
  {
    id: 6,
    addressName: "Cedar Heights",
    line1: "333 Cedar Avenue",
    postalCode: "13579",
  },
  {
    id: 7,
    addressName: "Birchwood Apartments",
    line1: "444 Birch Road",
    postalCode: "86420",
  },
  {
    id: 8,
    addressName: "Spruceview Residences",
    line1: "555 Spruce Lane",
    postalCode: "11111",
  },
  {
    id: 9,
    addressName: "Redwood Towers",
    line1: "666 Redwood Boulevard",
    postalCode: "22222",
  },
  {
    id: 10,
    addressName: "Sequoia Suites",
    line1: "777 Sequoia Drive",
    postalCode: "33333",
  },
];

// PET BUSINESS SEED DATA
const petBusinesses = [
  {
    id: 1,
    email: "john.doe123231@example.com",
    password: "password1234",
    companyName: "John's Company",
    uen: "12345678A",
    contactNumber: "93727651",
    businessAddresses: [{ addressId: 1 }, { addressId: 2 }],
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    password: "pass12345",
    companyName: "Smith's Pet Shop",
    uen: "12345678B",
    contactNumber: "5551234",
    businessAddresses: [{ addressId: 3 }, { addressId: 4 }],
  },
  {
    id: 3,
    email: "mike.petbiz@example.com",
    password: "secure1234",
    companyName: "Mike's Pet Business",
    uen: "12345678C",
    contactNumber: "12345678",
    businessAddresses: [{ addressId: 5 }],
  },
  {
    id: 4,
    email: "susan.animalstore@example.com",
    password: "mypets123",
    companyName: "Susan's Animal Store",
    uen: "12345678D",
    contactNumber: "98765432",
    businessAddresses: [{ addressId: 6 }],
  },
  {
    id: 5,
    email: "petstore123@example.com",
    password: "pets12345",
    companyName: "PetStore123",
    uen: "12345678E",
    contactNumber: "99999999",
    businessAddresses: [{ addressId: 7 }, { addressId: 8 }],
  },
];

async function seedUser(prisma) {
  for (const a of addresses) {
    await prisma.address.upsert({
      where: { addressId: a.id },
      update: {},
      create: {
        addressName: a.addressName,
        line1: a.line1,
        postalCode: a.postalCode,
      },
    });
  }

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
            businessAddresses: {
              connect: pb.businessAddresses,
            },
          },
        },
      },
    });
  }
}

module.exports = { petBusinesses, seedUser };
