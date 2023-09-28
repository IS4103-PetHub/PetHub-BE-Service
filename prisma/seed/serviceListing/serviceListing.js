const tags = [
  {
    id: 1,
    name: "Free",
  },
  {
    id: 2,
    name: "Not Free",
  },
  {
    id: 3,
    name: "Healthy",
  },
  {
    id: 4,
    name: "Training",
  },
  {
    id: 5,
    name: "Adoption",
  },
];

const serviceListings = [
  {
    id: 1,
    title: "Professional Pet Grooming",
    description: "Top-quality pet grooming services for your furry friend",
    petBusinessId: 1,
    category: "PET_GROOMING",
    basePrice: 40.0,
    tagIds: [{ tagId: 1 }, { tagId: 2 }, { tagId: 3 }],
    duration: 60
  },
  {
    id: 2,
    title: "Dog Training Session",
    description: "Expert dog training to teach your pet new tricks",
    petBusinessId: 1,
    category: "PET_RETAIL",
    basePrice: 60.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }, { tagId: 4 }],
    duration: 60
  },
  {
    id: 3,
    title: "Adopt a Pet Today",
    description: "Discover your perfect furry companion at our adoption event",
    petBusinessId: 5,
    category: "PET_RETAIL",
    basePrice: 0,
    tagIds: [{ tagId: 1 }, { tagId: 3 }, { tagId: 5 }],
    duration: 60
  },
  {
    id: 4,
    title: "Routine Pet Health Checkup",
    description:
      "Ensure your pet's well-being with our thorough health checkup",
    petBusinessId: 1,
    category: "VETERINARY",
    basePrice: 75.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    duration: 60
  },
  {
    id: 5,
    title: "Reliable Pet Sitting Service",
    description: "Trustworthy pet sitting services for your beloved pets",
    petBusinessId: 4,
    category: "VETERINARY",
    basePrice: 50.50,
    tagIds: [{ tagId: 1 }, { tagId: 2 }],
    duration: 60
  },
];

async function seedBusinessData(prisma) {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { tagId: tag.id },
      update: {},
      create: {
        name: tag.name,
      },
    });
  }

  for (const data of serviceListings) {
    await prisma.serviceListing.upsert({
      where: { serviceListingId: data.id },
      update: {},
      create: {
        title: data.title,
        description: data.description,
        basePrice: data.basePrice,
        category: data.category,
        tags: {
          connect: data.tagIds,
        },
        petBusiness: {
          connect: {
            userId: data.petBusinessId,
          },
        },
      },
    });
  }
}

module.exports = { serviceListings, tags, seedBusinessData };
