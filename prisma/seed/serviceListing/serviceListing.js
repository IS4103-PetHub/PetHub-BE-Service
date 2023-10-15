const fetch = require("node-fetch");
const s3ServiceInstance = require("../../../src/api/services/s3Service");

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

const groomingUrls = [
  {
    url: "https://bpanimalhospital.com/wp-content/uploads/shutterstock_1547371985.jpg",
    name: "dog_grooming_1",
  },
  {
    url: "https://images.squarespace-cdn.com/content/v1/5dda8663782768313a35b549/1626234766844-5DT4FUEXOY0YSBWOYM7U/Ultimate+List+Of+Best+Dog+Groomers+Singapore",
    name: "dog_grooming_2",
  },
  {
    url: "https://assets.petco.com/petco/image/upload/f_auto,q_auto:best/grooming-lp-by-appointment-bath-and-haircut-img-1000x667",
    name: "dog_grooming_3",
  },
  {
    url: "https://assets3.thrillist.com/v1/image/3059921/1200x630/flatten;crop_down;webp=auto;jpeg_quality=70",
    name: "cat_grooming_1",
  },
];

const vetUrls = [
  {
    url: "https://i.insider.com/5d289d6921a86120285e5e24?width=700",
    name: "dog_vet_1",
  },
  {
    url: "https://www.vetmed.com.au/wp-content/uploads/2019/03/How-to-Choose-Right-Vet-Clinic-for-Your-Multi-Breeds-Pets.jpg",
    name: "dog_vet_2",
  },
  {
    url: "https://img1.wsimg.com/isteam/ip/3b648486-0d2e-4fcd-8deb-ddb6ce935eb3/blob-0010.png",
    name: "dog_vet_3",
  },
];

const sittingUrls = [
  {
    url: "https://i.cbc.ca/1.6654160.1668638085!/fileImage/httpImage/image.jpg_gen/derivatives/original_780/what-to-consider-when-looking-for-a-pet-sitter.jpg",
    name: "dog_sitting_1",
  },
];

const serviceListings = [
  {
    id: 1,
    title: "Professional Pet Grooming",
    description:
      "Professional Pet Grooming offers top-quality pet grooming services for your beloved furry friend. Our dedicated team of experienced groomers is passionate about making your pet look and feel their best. We provide a range of grooming services, including bathing, nail trimming, ear cleaning, and haircuts, all designed to keep your pet clean, healthy, and happy. Our state-of-the-art grooming facility is equipped with the latest tools and equipment to ensure the safety and comfort of your pet during the grooming process. We use only premium, pet-friendly grooming products to ensure that your pet's skin and coat remain in excellent condition. At Professional Pet Grooming, we understand that every pet is unique, and we tailor our services to meet their specific needs. Whether your pet is a dog or a cat, a small breed or a large one, we provide personalized care to ensure they leave looking and feeling their best. Book an appointment with us today, and let us pamper your pet with the care and attention they deserve. Your furry friend will thank you for it!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 40.0,
    tagIds: [{ tagId: 1 }, { tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 1,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 2,
    title: "Dog Training Session",
    description:
      "Dog Training Session provides expert dog training to teach your pet new tricks. Our dedicated trainers are skilled in working with dogs of all breeds and ages. Whether your dog needs basic obedience training or advanced trick training, we have a program that suits their needs. Our training sessions are designed to be fun and engaging for your pet while ensuring they learn valuable skills. We use positive reinforcement techniques to encourage good behavior and strengthen the bond between you and your furry friend. With Dog Training Session, you'll have a well-behaved and happy dog in no time. Join our training classes and watch your pet's confidence and abilities grow!",
    petBusinessId: 1,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 60.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }, { tagId: 4 }],
    addressIds: [{ addressId: 2 }],
    duration: 60,
    calendarGroupId: 4,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 3,
    title: "Normal grooming waterslide experience",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 80.0,
    tagIds: [{ tagId: 1 }, { tagId: 4 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 1,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 4,
    title: "Routine Pet Health Checkup",
    description: "Ensure your pet's well-being with our thorough health checkup",
    petBusinessId: 1,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 75.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    duration: 60,
    addressIds: [{ addressId: 1 }, { addressId: 2 }],
    calendarGroupId: 3,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 5,
    title: "Reliable Pet Sitting Service",
    description: "Trustworthy pet sitting services for your beloved pets",
    petBusinessId: 4,
    category: "PET_BOARDING",
    requiresBooking: true,
    defaultExpiryDays: 30,
    lastPossibleDate: "2023-11-10T15:59:59.999Z",
    basePrice: 50.5,
    tagIds: [{ tagId: 1 }, { tagId: 2 }],
    duration: 60,
    addressIds: [{ addressId: 6 }],
    requiresBooking: false,
    defaultExpiryDays: 14,
  },
  {
    id: 6,
    title: "Cat Adoption Event",
    description: "Find your purr-fect feline friend at our cat adoption event",
    petBusinessId: 5,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    lastPossibleDate: "2023-12-30T15:59:59.999Z",
    basePrice: 0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 7 }, { addressId: 8 }],
    duration: 60,
    requiresBooking: false,
    defaultExpiryDays: 14,
  },
  {
    id: 7,
    title: "Adopt a Pet Today",
    description:
      "Adopt a Pet Today is your golden opportunity to embark on a heartwarming journey of discovering your perfect furry companion at our extraordinary adoption event. We proudly collaborate with local animal shelters, forging invaluable partnerships that allow us to present you with an irresistibly diverse selection of cats and dogs, each yearning for the love and warmth of a forever home.\n\nOur adoption process is not just simple; it's a straightforward path paved with compassion and care, making your journey to find a new pet as effortless as it is rewarding. Whether your heart desires the playful antics of a frisky kitten or the unwavering loyalty of a devoted canine companion, rest assured that our adoption center has a plethora of charming and charismatic pets eagerly waiting to make your acquaintance.\n\nOne of the most remarkable aspects of Adopt a Pet Today is our commitment to affordability. We firmly believe that love knows no price tag, and every pet deserves a chance to find a loving family. That's why our adoption fees are exceptionally reasonable, ensuring that you can open your heart and home to a deserving pet without breaking the bank.\n\nBut our dedication doesn't stop there. We go the extra mile to ensure that every pet who leaves our adoption center is equipped for a bright future. Before they become a part of your family, each of our pets undergoes essential medical care. They are spayed or neutered to help control the pet population and reduce the number of homeless animals. Our dedicated veterinary team administers vaccinations to keep your new companion in the pink of health. Additionally, we take the critical step of microchipping every pet, providing an extra layer of security to reunite lost pets with their loving owners.\n\nWhen you visit Adopt a Pet Today, you're not just finding a new best friend; you're giving a homeless pet a second chance at a happy, fulfilling life. It's a heartwarming journey filled with love, compassion, and boundless joy. Your decision to adopt a pet from our event is a powerful testament to your commitment to making the world a better place for animals in need.\n\nCome, be a part of this beautiful journey, and let us guide you toward your new best friend. Visit Adopt a Pet Today, where love knows no bounds, and where the extraordinary adventure of pet adoption begins.",
    petBusinessId: 5,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 0,
    tagIds: [{ tagId: 1 }, { tagId: 3 }, { tagId: 5 }],
    addressIds: [],
    requiresBooking: false,
    attachmentKeys: [
      "uploads/service-listing/img/eefb3b1b-8ecd-4901-acf7-06802cfa0771-adoption.jpg",
      "uploads/service-listing/img/4f34978d-afbf-433a-8300-f04a4af8c2ef-adoption2.jpg",
    ],
    attachmentURLs: [
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/eefb3b1b-8ecd-4901-acf7-06802cfa0771-adoption.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231010%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231010T135811Z&X-Amz-Expires=604800&X-Amz-Signature=301426c5f724e7ae46d2f55dd0fcbf2230442489ae849e11bd27769c8e5ded8e&X-Amz-SignedHeaders=host&x-id=GetObject",
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/4f34978d-afbf-433a-8300-f04a4af8c2ef-adoption2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231010%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231010T135811Z&X-Amz-Expires=604800&X-Amz-Signature=7a7d872a9c5be2b6deaef9c6e196634c026697edf72f6e1a94715a7d7e1e69d6&X-Amz-SignedHeaders=host&x-id=GetObject",
    ],
    defaultExpiryDays: 14,
  },
  {
    id: 8,
    title: "VIP grooming ninja offering",
    description: "Treat your pets to a day of grooming by VIP groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 120.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 2,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 9,
    title: "John's new vet experiment",
    description: "Hi, my name is John and I just got my vet license, let's put it to the test!",
    petBusinessId: 1,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 20.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 3,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 10,
    title: "Dog Sitting with John",
    description:
      "Enjoy peace of mind knowing that your dog is in good hands with John. Whether it's for a few hours or an evening, your dog will receive personalized attention and care. We'll make sure your dog feels comfortable and happy while you're away. Book a dog sitting session with us, and let your furry companion have a great time with John!",
    petBusinessId: 1,
    category: "PET_BOARDING",
    basePrice: 30.0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 1 }],
    duration: 180,
    calendarGroupId: 5,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  // This service listings (id 11-12) have requiresBooking: true but no CG
  // On the customer side, pet owners should not be able to see these listings as this SL is invalid.
  {
    id: 11,
    title: "Normal grooming fun times",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 2,
    category: "PET_GROOMING",
    basePrice: 70.0,
    tagIds: [{ tagId: 3 }, { tagId: 5 }],
    addressIds: [{ addressId: 3 }],
    duration: 60,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  {
    id: 12,
    title: "Puppy Training Class",
    description: "Join our fun and interactive puppy training class!",
    petBusinessId: 3,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 50.0,
    tagIds: [{ tagId: 1 }, { tagId: 5 }],
    addressIds: [],
    duration: 90,
    requiresBooking: true,
    defaultExpiryDays: 14,
  },
  // These service listings (id 13-15) are tagged to petBusinessId [6, 7], who are non-active
  // On the customer side, pet owners should not be able to see these listings as the PB is not an active user.
  {
    id: 13,
    title: "Pet Boarding and Daycare",
    description: "Give your pet a home away from home with our boarding and daycare services.",
    petBusinessId: 5,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 35.0,
    tagIds: [{ tagId: 2 }],
    addressIds: [],
    duration: 1440, // 24 hours
    defaultExpiryDays: 14,
  },
  {
    id: 14,
    title: "Cat Grooming Special",
    description: "Pamper your feline friend with our cat grooming services.",
    petBusinessId: 6,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 60.0,
    tagIds: [],
    addressIds: [],
    defaultExpiryDays: 14,
  },
  {
    id: 15,
    title: "Dog Walking Adventure",
    description: "Let our experienced dog walkers take your furry friend on an exciting adventure!",
    petBusinessId: 5,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 30.0,
    tagIds: [{ tagId: 4 }],
    addressIds: [],
    defaultExpiryDays: 14,
  },
  // This service listing (id 16) will have a lastPossibleDate to be < currentDate
  // On the customer side, pet owners should not be able to see these listings as the SL is already invalid.
  {
    id: 16,
    title: "Pet Photography Session",
    description: "Capture beautiful moments with your pets in a professional photoshoot.",
    petBusinessId: 2,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 75.0,
    tagIds: [{ tagId: 3 }],
    addressIds: [],
    defaultExpiryDays: 14,
  },
];

async function seedBusinessData(prisma) {
  const groomingFiles = [];
  for (const imageUrl of groomingUrls) {
    const file = await remoteImageUrlToFile(imageUrl.url, imageUrl.name);
    groomingFiles.push(file);
  }

  const groomingKey = await s3ServiceInstance.uploadImgFiles(groomingFiles, "service-listing");
  const groomingUrl = await s3ServiceInstance.getObjectSignedUrl(groomingKey);

  const vetFiles = [];
  for (const imageUrl of vetUrls) {
    const file = await remoteImageUrlToFile(imageUrl.url, imageUrl.name);
    vetFiles.push(file);
  }
  const vetKey = await s3ServiceInstance.uploadImgFiles(vetFiles, "service-listing");
  const vetUrl = await s3ServiceInstance.getObjectSignedUrl(vetKey);

  const sittingFiles = [];
  for (const imageUrl of sittingUrls) {
    const file = await remoteImageUrlToFile(imageUrl.url, imageUrl.name);
    sittingFiles.push(file);
  }
  const sittingKey = await s3ServiceInstance.uploadImgFiles(sittingFiles, "service-listing");
  const sittingUrl = await s3ServiceInstance.getObjectSignedUrl(sittingKey);

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
    const createObject = {
      title: data.title,
      description: data.description,
      defaultExpiryDays: data.defaultExpiryDays,
      lastPossibleDate: data.lastPossibleDate,
      requiresBooking: data.requiresBooking,
      basePrice: data.basePrice,
      category: data.category,
      duration: data.duration,
      requiresBooking: data.requiresBooking,
      lastPossibleDate: getRandomFutureDate(),
      defaultExpiryDays: data.defaultExpiryDays,
      tags: {
        connect: data.tagIds,
      },
      addresses: {
        connect: data.addressIds,
      },
      petBusiness: {
        connect: {
          userId: data.petBusinessId,
        },
      },
    };

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    switch (data.id) {
      case 9:
        createObject.attachmentKeys = groomingKey;
        createObject.attachmentURLs = groomingUrl;
        break;
      case 10:
        createObject.attachmentKeys = vetKey;
        createObject.attachmentURLs = vetUrl;
        break;
      case 16:
        createObject.attachmentKeys = sittingKey;
        createObject.attachmentURLs = sittingUrl;
        createObject.lastPossibleDate = pastDate;
        break;
      default:
        break;
    }

    // Check if data.calendarGroupId exists before adding it to createObject
    if (data.calendarGroupId) {
      createObject.CalendarGroup = {
        connect: { calendarGroupId: data.calendarGroupId },
      };
    }

    await prisma.serviceListing.upsert({
      where: { serviceListingId: data.id },
      update: createObject,
      create: createObject,
    });
  }
}

async function remoteImageUrlToFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch the image: ${response.status} - ${response.statusText}`);
    }
    const buffer = await response.buffer();
    return { buffer: buffer, originalname: filename };
  } catch (error) {
    console.error("Error converting remote image to File:", error);
    throw error;
  }
}

// get random future date from today, will be randomized to be between 1-12 weeks from the current date
function getRandomFutureDate() {
  const currentDate = new Date();
  const daysToAdd = Math.floor(Math.random() * 77) + 7; // Random value between 7 and 84 (1 to 12 weeks)
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate;
}

module.exports = { serviceListings, tags, seedBusinessData };
