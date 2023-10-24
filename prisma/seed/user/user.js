const { AccountStatus, AccountType, BusinessType, BusinessApplicationStatus, PetType, Gender } = require("@prisma/client");
const bcrypt = require("bcryptjs"); // bcrypt for password hashing

// USE COMMON PASSWORD
const commonPassword = 'password123'

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
    email: "john.doe@example.com",
    password: commonPassword,
    companyName: "John's Company",
    uen: "12345678A",
    contactNumber: "93727651",
    businessAddresses: [{ addressId: 1 }, { addressId: 2 }],
    businessDescription: "John's Company is a leading pet grooming service provider dedicated to enhancing the well-being of your beloved furry friends. With a passion for pets and a team of experienced groomers, we offer top-notch grooming services that go beyond mere pampering. We believe that grooming is an essential part of your pet's overall health and happiness.\n\nOur state-of-the-art grooming facility is designed to ensure the comfort and safety of your pets. We use only the finest pet-friendly products, and our team is trained to provide personalized care to meet your pet's unique needs.\n\nAt John Companys, we understand the significance of the bond between pets and their owners. That's why we strive to make every grooming experience a positive one. From bathing to nail trimming and ear cleaning to haircuts, we take care of it all.\n\nVisit our website at https://www.google.com to learn more about our services and book an appointment. Trust us to keep your pets looking and feeling their best!",
    websiteURL: "https://www.johnDoe.com",
    businessEmail: "biz1@example.com",
    businessType: BusinessType.SERVICE,
    commissionRuleId: 1,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz1@example.com",
      websiteURL: "https://www.johnDoe.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    password: commonPassword,
    companyName: "Smith's Pet Shop",
    uen: "12345678B",
    contactNumber: "88712892",
    businessAddresses: [{ addressId: 3 }, { addressId: 4 }],
    businessDescription: "My Pet Shop is your one-stop destination for all your feline grooming needs. We are dedicated to providing the best grooming experience for cats of all breeds and sizes. Our passionate team of cat groomers is well-trained in handling cats with care and patience, ensuring a stress-free grooming session.\n\nWe understand that cats have unique grooming requirements, and we tailor our services to meet those needs. From fur brushing to nail trimming and ear cleaning to baths, we offer a comprehensive range of grooming services.\n\nAt Smith's Pet Shop, we believe that a well-groomed cat is a happy and healthy cat. Our grooming sessions not only keep your cats clean but also help in early detection of any health issues. We use premium, cat-friendly grooming products to ensure your cat's comfort and safety.\n\nVisit our website at https://www.google.com to explore our services and book an appointment. Let us pamper your feline friend and keep them looking and feeling their best!",
    websiteURL: "https://www.janeSmithMOW.com",
    businessEmail: "janeSmithPet@gmail.com",
    businessType: BusinessType.SERVICE,
    commissionRuleId: 1,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "janeSmithPet.com",
      websiteURL: "https://www.google.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 3,
    email: "mike.petbiz@example.com",
    password: commonPassword,
    companyName: "Mike's Pet Business",
    uen: "12345678C",
    contactNumber: "97128913",
    businessAddresses: [{ addressId: 5 }],
    businessDescription: "I like pets",
    businessEmail: "mikePets@gmail.com",
    websiteURL: "https://www.mikePetBiz.com",
    businessType: BusinessType.SERVICE,
    commissionRuleId: 1,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz3@example.com",
      websiteURL: "https://www.mikePetBiz.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 4,
    email: "susan.animalstore@example.com",
    password: commonPassword,
    companyName: "Susan's Animal Store",
    uen: "12345678D",
    contactNumber: "98765432",
    businessAddresses: [{ addressId: 6 }],
    businessDescription: "We groom rabbits",
    websiteURL: "https://www.susanAnimal.com",
    businessEmail: "susanLovesDogs@hotmail.com",
    businessType: BusinessType.SERVICE,
    commissionRuleId: 1,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "biz4@example.com",
      websiteURL: "https://www.susanAnimal.com",
      businessDescription: "This was my business description before I changed it",
      applicationStatus: BusinessApplicationStatus.APPROVED,
      lastUpdated: new Date(),
    },
  },
  {
    id: 5,
    email: "linensoda@gmail.com",
    password: commonPassword,
    companyName: "PetStore123",
    uen: "12345678E",
    contactNumber: "91789278",
    businessAddresses: [{ addressId: 7 }, { addressId: 8 }],
    businessDescription: "We groom birds",
    websiteURL: "https://www.google.com",
    businessEmail: "linensoda@gmail.com",
    businessType: BusinessType.SERVICE,
    commissionRuleId: 1,
    petBusinessApplication: {
      businessType: "SERVICE",
      businessEmail: "linensoda@gmail.com",
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
    password: commonPassword,
    companyName: "Groomer1",
    uen: "12345678F",
    contactNumber: "91627863",
    commissionRuleId: 1,
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
    password: commonPassword,
    companyName: "Groomer2",
    uen: "12345678G",
    contactNumber: "87168812",
    commissionRuleId: 1,
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
    password: commonPassword,
    companyName: "Groomer3",
    uen: "12345678H",
    contactNumber: "83192732",
    commissionRuleId: 1,
  },
];

const petOwners = [
  {
    id: 9,
    email: "petowner2@example.com",
    password: commonPassword,
    firstName: "Li",
    lastName: "Chen",
    contactNumber: "88712892",
    dateOfBirth: new Date("1985-08-20"),
  },
  {
    id: 10,
    email: "petowner3@example.com",
    password: commonPassword,
    firstName: "Ming",
    lastName: "Liu",
    contactNumber: "97128913",
    dateOfBirth: new Date("1988-04-10"),
  },
  {
    id: 11,
    email: "petowner4@example.com",
    password: commonPassword,
    firstName: "Wei",
    lastName: "Zhang",
    contactNumber: "98765432",
    dateOfBirth: new Date("1983-12-05"),
  },
  {
    id: 12,
    email: "petowner5@example.com",
    password: commonPassword,
    firstName: "Yuki",
    lastName: "Tanaka",
    contactNumber: "91789278",
    dateOfBirth: new Date("1987-06-18"),
  },
  {
    id: 13,
    email: "petowner6@example.com",
    password: commonPassword,
    firstName: "Sato",
    lastName: "Nakamura",
    contactNumber: "87654321",
    dateOfBirth: new Date("1992-03-25"),
  },
  {
    id: 14,
    email: "petowner7@example.com",
    password: commonPassword,
    firstName: "Han",
    lastName: "Kim",
    contactNumber: "86543210",
    dateOfBirth: new Date("1995-11-12"),
  },
  {
    id: 15,
    email: "petowner8@example.com",
    password: commonPassword,
    firstName: "Jung",
    lastName: "Park",
    contactNumber: "95432109",
    dateOfBirth: new Date("1986-09-02"),
  },
  {
    id: 16,
    email: "petowner9@example.com",
    password: commonPassword,
    firstName: "Ming",
    lastName: "Wong",
    contactNumber: "94321098",
    dateOfBirth: new Date("1990-07-14"),
  },
  {
    id: 17,
    email: "petowner10@example.com",
    password: commonPassword,
    firstName: "Linh",
    lastName: "Nguyen",
    contactNumber: "93210987",
    dateOfBirth: new Date("1994-02-27"),
  },
  {
    id: 18,
    email: "is4103pethub@gmail.com",
    password: commonPassword,
    firstName: "Linda",
    lastName: "Lim",
    contactNumber: "83689987",
    dateOfBirth: new Date("1994-02-27"),
  }
];

const pets = [
  {
    petId: 1,
    petName: "Fido",
    petType: PetType.DOG,
    gender: Gender.MALE,
    dateOfBirth: new Date("2018-05-10"),
    petWeight: 15.5,
    microchipNumber: "ABC123",
    petOwnerId: 9,
  },
  {
    petId: 2,
    petName: "Whiskers",
    petType: PetType.CAT,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("2019-02-28"),
    petWeight: 7.2,
    microchipNumber: "XYZ789",
    petOwnerId: 9,
  },
  {
    petId: 3,
    petName: "Buddy",
    petType: PetType.DOG,
    gender: Gender.MALE,
    dateOfBirth: new Date("2017-09-15"),
    petWeight: 22.3,
    microchipNumber: "DEF456",
    petOwnerId: 11,
  },
  {
    petId: 4,
    petName: "Mittens",
    petType: PetType.CAT,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("2020-03-12"),
    petWeight: 6.8,
    microchipNumber: "HIJ789",
    petOwnerId: 12,
  },
  {
    petId: 5,
    petName: "Tweety",
    petType: PetType.BIRD,
    gender: Gender.MALE,
    dateOfBirth: new Date("2019-07-08"),
    petWeight: 0.3,
    microchipNumber: "KLM101",
    petOwnerId: 12,
  },
  {
    petId: 6,
    petName: "Shelly",
    petType: PetType.TERRAPIN,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("2015-11-25"),
    petWeight: 1.5,
    microchipNumber: "NOP111",
    petOwnerId: 12,
  },
  {
    petId: 7,
    petName: "Hopper",
    petType: PetType.RABBIT,
    gender: Gender.MALE,
    dateOfBirth: new Date("2018-06-30"),
    petWeight: 4.7,
    microchipNumber: "QRS222",
    petOwnerId: 13,
  },
  {
    petId: 8,
    petName: "Squeaky",
    petType: PetType.RODENT,
    gender: Gender.MALE,
    dateOfBirth: new Date("2021-01-05"),
    petWeight: 0.2,
    microchipNumber: "TUV333",
    petOwnerId: 15,
  },
  {
    petId: 9,
    petName: "Fluffy",
    petType: PetType.OTHERS,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("2019-09-22"),
    petWeight: 12.0,
    microchipNumber: "WXYZ444",
    petOwnerId: 16,
  },
  {
    petId: 10,
    petName: "Rocky",
    petType: PetType.DOG,
    gender: Gender.MALE,
    dateOfBirth: new Date("2016-11-14"),
    petWeight: 18.9,
    microchipNumber: "123ABC",
    petOwnerId: 17,
  },
  {
    petId: 11,
    petName: "Whiskers Jr.",
    petType: PetType.CAT,
    gender: Gender.MALE,
    dateOfBirth: new Date("2022-02-17"),
    petWeight: 7.0,
    microchipNumber: "456DEF",
    petOwnerId: 17,
  },
  {
    petId: 12,
    petName: "Tweety Jr.",
    petType: PetType.BIRD,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("2020-08-05"),
    petWeight: 0.2,
    microchipNumber: "789GHI",
    petOwnerId: 17,
  },
];




async function seedUser(prisma) {

  const oneYearFromToday = new Date();
  oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() - 1);

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
            websiteURL: pb.websiteURL,
            commissionRuleId: 1,
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
      commissionRuleId: 1,
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

  for (const po of petOwners) {
    await prisma.user.upsert({
      where: { userId: po.id },
      update: {},
      create: {
        email: po.email,
        password: await bcrypt.hash(po.password, 10),
        accountType: AccountType.PET_OWNER,
        accountStatus: AccountStatus.ACTIVE,
        dateCreated: oneYearFromToday,
        petOwner: {
          create: {
            firstName: po.firstName,
            lastName: po.lastName,
            contactNumber: po.contactNumber,
            dateOfBirth: po.dateOfBirth,
          },
        },
      },
    });
  }

  for (const pet of pets) {
    await prisma.pet.upsert({
      where: { petId: pet.petId },
      update: {},
      create: {
        petName: pet.petName,
        petType: pet.petType,
        gender: pet.gender,
        dateOfBirth: pet.dateOfBirth,
        petWeight: pet.petWeight,
        microchipNumber: pet.microchipNumber,
        petOwnerId: pet.petOwnerId,
      },
    });
  }
}

module.exports = { petBusinesses, seedUser };
