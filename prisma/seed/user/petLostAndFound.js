const { remoteImageUrlToFile } = require("../serviceListing/serviceListing");
const s3ServiceInstance = require("../../../src/api/services/s3Service");

const petLostAndFoundData = [
  {
    title: "Lost Cat",
    description: "A black and white cat with green eyes.",
    requestType: "LOST_PET", 
    lastSeenDate: new Date("2023-11-15"),
    lastSeenLocation: "Bedok Avenue 1, Capstone Street",
    url: "https://img.freepik.com/premium-photo/black-white-cat-with-green-eyes_717472-3153.jpg?w=360",
    name: "LNF-1",
    contactNumber: "92632187",
    petId: 2,
    userId: 9,
  },
  {
    title: "Lost Dog - Golden Retriever",
    description:
      "Friendly golden retriever, responds to the name 'Buddy'. Missing since yesterday evening.",
    requestType: "LOST_PET",
    lastSeenDate: new Date("2023-11-13"),
    lastSeenLocation: "Blk 4103, NUS Road",
    url: "https://petreader.net/wp-content/uploads/2021/03/1-45.jpg",
    name: "LNF-2",
    contactNumber: "91928731",
    petId: 3,
    userId: 11,
  },
  {
    title: "Missing Cat - Gray Tabby",
    description:
      "Small gray tabby cat with a white spot on the chest. Responds to 'Whiskers'.",
    requestType: "LOST_PET",
    lastSeenDate: new Date("2023-11-10"),
    lastSeenLocation: "Information Drive, Systems Avenue",
    url: "https://www.outdoorbengal.com/cdn/shop/articles/lost-cat-6-tips-to-find-a-cat-thats-gone-missing-or-escaped-625360_1600x.jpg?v=1679936573",
    name: "LNF-3",
    contactNumber: "84283642",
    petId: 11,
    userId: 17,
  },
  {
    title: "Found Cat - Siamese Mix",
    description:
      "Siamese mix cat found near the park. Very friendly and seems well cared for.",
    requestType: "FOUND_PET",
    lastSeenDate: new Date("2023-11-12"),
    lastSeenLocation: "Mow Town",
    url: "https://a.storyblok.com/f/176726/1087x721/f6d4b66ec8/about-siamese-cats.jpeg/m/716x0",
    name: "LNF-4",
    contactNumber: "81726781",
    petId: 9,
    userId: 16,
  },
  {
    title: "UPDATED: Found Dog - Labrador Mix",
    description:
      "Labrador mix found wandering around the neighborhood. Wearing a red collar.",
    requestType: "FOUND_PET",
    lastSeenDate: new Date("2023-11-11"),
    lastSeenLocation: "Serangoon Street 4103, S(IS4103)",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Funny_black_lab_mix_dog%27s_look.jpg/675px-Funny_black_lab_mix_dog%27s_look.jpg",
    name: "LNF-5",
    contactNumber: "98312782",
    petId: 10,
    userId: 17,
  },
];

async function seedPetLostAndFound(prisma) {
  for (const data of petLostAndFoundData) {
    const LNFFiles = [];
    const file = await remoteImageUrlToFile(data.url, data.name);
    LNFFiles.push(file);

    const key = await s3ServiceInstance.uploadImgFiles(LNFFiles, "pet-lost-and-found");
    const url = await s3ServiceInstance.getObjectSignedUrl(key);

    await prisma.petLostAndFound.create({
      data: {
        title: data.title,
        description: data.description,
        requestType: data.requestType,
        lastSeenDate: data.lastSeenDate,
        lastSeenLocation: data.lastSeenLocation,
        attachmentURLs: url,
        attachmentKeys: key,
        contactNumber: data.contactNumber,
        pet: {
          connect: { petId: data.petId },
        },
        petOwner: {
          connect: { userId: data.userId },
        },
      },
    });
  }
}

module.exports = { seedPetLostAndFound };
