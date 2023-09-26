const { AccountStatus, AccountType, BusinessType, BusinessApplicationStatus } = require("@prisma/client");
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
  {
    id: 11, // For PB 7
    addressName: "HQ",
    line1: "7 Groomer Road",
    line2: "Red Building",
    postalCode: "33333",
  },
  {
    id: 12, // For PB 7
    addressName: "Side Office",
    line1: "777 Sequoia Drive",
    postalCode: "33333",
  },
];

// PET BUSINESS SEED DATA (active)
const petBusinesses = [
  {
    id: 1,
    email: "john.doe123231@example.com",
    password: "password1234",
    companyName: "John Companys",
    uen: "12345678A",
    contactNumber: "93727651",
    businessAddresses: [{ addressId: 1 }, { addressId: 2 }],
    businessDescription: "We groom dogs",
    websiteURL: "https://www.google.com",
    businessEmail: "biz1@example.com",
    businessType: BusinessType.SERVICE,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz1@example.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    password: "pass12345",
    companyName: "Smith's Pet Shop",
    uen: "12345678B",
    contactNumber: "88712892",
    businessAddresses: [{ addressId: 3 }, { addressId: 4 }],
    businessDescription: "We groom cats",
    businessEmail: "biz2@example.com",
    businessType: BusinessType.SERVICE,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz2@example.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 3,
    email: "mike.petbiz@example.com",
    password: "secure1234",
    companyName: "Mike's Pet Business",
    uen: "12345678C",
    contactNumber: "97128913",
    businessAddresses: [{ addressId: 5 }],
    businessDescription: "We groom hamsters",
    businessEmail: "biz3@example.com",
    websiteURL: "https://www.google.com",
    businessType: BusinessType.SERVICE,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz3@example.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 4,
    email: "susan.animalstore@example.com",
    password: "mypets123",
    companyName: "Susan's Animal Store",
    uen: "12345678D",
    contactNumber: "98765432",
    businessAddresses: [{ addressId: 6 }],
    businessDescription: "We groom rabbits",
    businessEmail: "biz4@example.com",
    businessType: BusinessType.SERVICE,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz4@example.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 5,
    email: "petstore123@example.com",
    password: "pets12345",
    companyName: "PetStore123",
    uen: "12345678E",
    contactNumber: "91789278",
    businessAddresses: [{ addressId: 7 }, { addressId: 8 }],
    businessDescription: "We groom birds",
    websiteURL: "https://www.google.com",
    businessEmail: "biz5@example.com",
    businessType: BusinessType.SERVICE,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz5@example.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
];

// PET BUSINESS SEED DATA (NON ACTIVE)
const nonActivePetBusinesses = [
  {
    id: 6,
    email: "groomer1@example.com",
    password: "password123",
    companyName: "Groomer1",
    uen: "12345678E",
    contactNumber: "91627863",
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz6@example.com",
      websiteURL: "https://www.google.com",
      businessDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      lastUpdated: new Date(),
    },
  },
  {
    id: 7,
    email: "groomer2@example.com",
    password: "password123",
    companyName: "Groomer2",
    uen: "12345678E",
    contactNumber: "87168812",
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz7@example.com",
      websiteURL: "https://www.google.com",
      businessDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      businessAddresses: [{ addressId: 11 }, { addressId: 12 }],
      adminRemarks: ["Your business description is wonky."],
      applicationStatus: BusinessApplicationStatus.REJECTED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 8,
    email: "groomer3@example.com",
    password: "password123",
    companyName: "Groomer3",
    uen: "12345678E",
    contactNumber: "83192732",
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
            businessEmail: pb.businessEmail,
            businessDescription: pb.businessDescription,
            businessType: pb.businessType,
            petBusinessApplication: {
              create: pb.petBusinessApplication,
            },
          },
        },
      },
    });
  }

  for (const pb of nonActivePetBusinesses) {
    const petBusinessData = {
      companyName: pb.companyName,
      uen: pb.uen,
      contactNumber: pb.contactNumber,
    };
    if ([6, 7].includes(pb.id)) {
      petBusinessData.petBusinessApplication = {
        create: {
          ...pb.petBusinessApplication,
          businessAddresses: {
            connect: pb.petBusinessApplication.businessAddresses,
          },
        },
      };
    }
    await prisma.user.upsert({
      where: { userId: pb.id },
      update: {},
      create: {
        email: pb.email,
        password: await bcrypt.hash(pb.password, 10),
        accountType: AccountType.PET_BUSINESS,
        accountStatus: [6, 7].includes(pb.id) ? AccountStatus.PENDING : AccountStatus.INACTIVE, // PBs 6 and 7 are pending, 8 is inactive (new user)
        petBusiness: {
          create: petBusinessData,
        },
      },
    });
  }
}

module.exports = { petBusinesses, seedUser };
