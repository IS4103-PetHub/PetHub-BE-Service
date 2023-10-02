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
  }
];

const serviceListings = [
  {
    id: 1,
    title: "Professional Pet Grooming",
    description:
      "Professional Pet Grooming offers top-quality pet grooming services for your beloved furry friend. Our dedicated team of experienced groomers is passionate about making your pet look and feel their best. We provide a range of grooming services, including bathing, nail trimming, ear cleaning, and haircuts, all designed to keep your pet clean, healthy, and happy. Our state-of-the-art grooming facility is equipped with the latest tools and equipment to ensure the safety and comfort of your pet during the grooming process. We use only premium, pet-friendly grooming products to ensure that your pet's skin and coat remain in excellent condition. At Professional Pet Grooming, we understand that every pet is unique, and we tailor our services to meet their specific needs. Whether your pet is a dog or a cat, a small breed or a large one, we provide personalized care to ensure they leave looking and feeling their best. Book an appointment with us today, and let us pamper your pet with the care and attention they deserve. Your furry friend will thank you for it!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    basePrice: 40.0,
    tagIds: [{ tagId: 1 }, { tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 1,
    attachmentKeys: [
      "uploads/service-listing/img/87406424-b762-42c8-bd0b-a3c353696fca-grooming.jpg",
      "uploads/service-listing/img/10b616a7-3431-4ed8-9409-85f12482dd2d-grooming2.jpg",
      "uploads/service-listing/img/dce12868-a4bd-4b04-9b92-2ce0fe334fe7-catgroom.png",
      "uploads/service-listing/img/bff26a4a-b2e3-482f-8d5c-907299136cf5-images (1).jpg",
    ],
    attachmentURLs: [
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/87406424-b762-42c8-bd0b-a3c353696fca-grooming.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T155923Z&X-Amz-Expires=604800&X-Amz-Signature=810c9c90b7d568bcecfb0afbafe488e40f2d8c00e7e5509645c9e5bd701faa6b&X-Amz-SignedHeaders=host&x-id=GetObject",
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/10b616a7-3431-4ed8-9409-85f12482dd2d-grooming2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T155923Z&X-Amz-Expires=604800&X-Amz-Signature=69a0dae6dba28e6429c614b4575f1dbf550a227153ac120b391b4392d87e9027&X-Amz-SignedHeaders=host&x-id=GetObject",
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/dce12868-a4bd-4b04-9b92-2ce0fe334fe7-catgroom.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T161720Z&X-Amz-Expires=604800&X-Amz-Signature=641d4785b42c7007a28af85e737011bbe653497764db4f2fe4df53f71d318ff0&X-Amz-SignedHeaders=host&x-id=GetObject",
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/bff26a4a-b2e3-482f-8d5c-907299136cf5-images%20%281%29.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T155923Z&X-Amz-Expires=604800&X-Amz-Signature=28f0e81ec01e3391dd93575b36da3dde93406cbdd677b844bcd415603886932d&X-Amz-SignedHeaders=host&x-id=GetObject",
    ],
  },
  {
    id: 2,
    title: "Dog Training Session",
    description:
      "Dog Training Session provides expert dog training to teach your pet new tricks. Our dedicated trainers are skilled in working with dogs of all breeds and ages. Whether your dog needs basic obedience training or advanced trick training, we have a program that suits their needs. Our training sessions are designed to be fun and engaging for your pet while ensuring they learn valuable skills. We use positive reinforcement techniques to encourage good behavior and strengthen the bond between you and your furry friend. With Dog Training Session, you'll have a well-behaved and happy dog in no time. Join our training classes and watch your pet's confidence and abilities grow!",
    petBusinessId: 1,
    category: "PET_BOARDING",
    basePrice: 60.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }, { tagId: 4 }],
    addressIds: [{ addressId: 2 }],
    duration: 60,
    calendarGroupId: 4,
    attachmentKeys: [
      "uploads/service-listing/img/7a891169-465d-44c0-bac4-1b7bd70a8e60-download (1).jpg",
    ],
    attachmentURLs: [
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/7a891169-465d-44c0-bac4-1b7bd70a8e60-download%20%281%29.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T160737Z&X-Amz-Expires=604800&X-Amz-Signature=e2fa96216526445bb77f26bf692651304c4edd25a5c18cec1c9d19a90b0a07e8&X-Amz-SignedHeaders=host&x-id=GetObject",
    ],
  },
  {
    id: 3,
    title: "Adopt a Pet Today",
    description:
      "Adopt a Pet Today is your golden opportunity to embark on a heartwarming journey of discovering your perfect furry companion at our extraordinary adoption event. We proudly collaborate with local animal shelters, forging invaluable partnerships that allow us to present you with an irresistibly diverse selection of cats and dogs, each yearning for the love and warmth of a forever home.\n\nOur adoption process is not just simple; it's a straightforward path paved with compassion and care, making your journey to find a new pet as effortless as it is rewarding. Whether your heart desires the playful antics of a frisky kitten or the unwavering loyalty of a devoted canine companion, rest assured that our adoption center has a plethora of charming and charismatic pets eagerly waiting to make your acquaintance.\n\nOne of the most remarkable aspects of Adopt a Pet Today is our commitment to affordability. We firmly believe that love knows no price tag, and every pet deserves a chance to find a loving family. That's why our adoption fees are exceptionally reasonable, ensuring that you can open your heart and home to a deserving pet without breaking the bank.\n\nBut our dedication doesn't stop there. We go the extra mile to ensure that every pet who leaves our adoption center is equipped for a bright future. Before they become a part of your family, each of our pets undergoes essential medical care. They are spayed or neutered to help control the pet population and reduce the number of homeless animals. Our dedicated veterinary team administers vaccinations to keep your new companion in the pink of health. Additionally, we take the critical step of microchipping every pet, providing an extra layer of security to reunite lost pets with their loving owners.\n\nWhen you visit Adopt a Pet Today, you're not just finding a new best friend; you're giving a homeless pet a second chance at a happy, fulfilling life. It's a heartwarming journey filled with love, compassion, and boundless joy. Your decision to adopt a pet from our event is a powerful testament to your commitment to making the world a better place for animals in need.\n\nCome, be a part of this beautiful journey, and let us guide you toward your new best friend. Visit Adopt a Pet Today, where love knows no bounds, and where the extraordinary adventure of pet adoption begins.",
    petBusinessId: 5,
    category: "PET_RETAIL",
    basePrice: 0,
    tagIds: [{ tagId: 1 }, { tagId: 3 }, { tagId: 5 }],
    duration: 60,
    addressIds: [],
    attachmentKeys: [
      "uploads/service-listing/img/ad39fe6b-9fa2-4802-9c13-b27b1674855b-adoption.jpg",
      "uploads/service-listing/img/32b4472a-2da4-4dd9-9aa8-a8380ac53754-adoption2.jpg",
    ],
    attachmentURLs: [
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/ad39fe6b-9fa2-4802-9c13-b27b1674855b-adoption.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T160849Z&X-Amz-Expires=604800&X-Amz-Signature=0dddf7dcd4e74db24994d6a250e32f71ef127c66ae070f076c81a18feb9ad632&X-Amz-SignedHeaders=host&x-id=GetObject",
      "https://pethub-data-lake-default.s3.ap-southeast-1.amazonaws.com/uploads/service-listing/img/32b4472a-2da4-4dd9-9aa8-a8380ac53754-adoption2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA3X6HC7JLMRAUOW66%2F20231002%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231002T160849Z&X-Amz-Expires=604800&X-Amz-Signature=8404190b86ee47b89cb0d19c68b72e2244ca8f8629d31c4b9109d83c0699256f&X-Amz-SignedHeaders=host&x-id=GetObject",
    ],
  },
  {
    id: 4,
    title: "Routine Pet Health Checkup",
    description: "Ensure your pet's well-being with our thorough health checkup",
    petBusinessId: 1,
    category: "VETERINARY",
    basePrice: 75.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    duration: 60,
    addressIds: [{ addressId: 1 }, { addressId: 2 }],
    calendarGroupId: 3,
  },
  {
    id: 5,
    title: "Reliable Pet Sitting Service",
    description: "Trustworthy pet sitting services for your beloved pets",
    petBusinessId: 4,
    category: "PET_BOARDING",
    basePrice: 50.5,
    tagIds: [{ tagId: 1 }, { tagId: 2 }],
    duration: 60,
    addressIds: [{ addressId: 6 }],
  },
  {
    id: 6,
    title: "Cat Adoption Event",
    description: "Find your purr-fect feline friend at our cat adoption event",
    petBusinessId: 5,
    category: "PET_RETAIL",
    basePrice: 0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 7 }, { addressId: 8 }],
    duration: 60,
  },
  {
    id: 7,
    title: "Normal grooming fun times",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 2,
    category: "PET_GROOMING",
    basePrice: 70.0,
    tagIds: [{ tagId: 3 }, { tagId: 5 }],
    addressIds: [{ addressId: 3 }],
    duration: 60,
  },
  {
    id: 8,
    title: "Normal grooming waterslide experience",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    basePrice: 80.0,
    tagIds: [{ tagId: 1 }, { tagId: 4 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 1,
  },
  {
    id: 9,
    title: "VIP grooming ninja offering",
    description: "Treat your pets to a day of grooming by VIP groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    basePrice: 120.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 2,
  },
  {
    id: 10,
    title: "John's new vet experiment",
    description: "Hi, my name is John and I just got my vet license, let's put it to the test!",
    petBusinessId: 1,
    category: "VETERINARY",
    basePrice: 20.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 3,
  },
  // These service listings (id 11-15) are tagged to petBusinessId [6, 7], who are non-active
  // On the customer side, pet owners should not be able to see these listings as the PB is not an active user.
  {
    id: 11,
    title: "Puppy Training Class",
    description: "Join our fun and interactive puppy training class!",
    petBusinessId: 6,
    category: "PET_BOARDING",
    basePrice: 50.0,
    tagIds: [{ tagId: 1 }, { tagId: 5 }],
    addressIds: [],
    duration: 90,
  },
  {
    id: 12,
    title: "Pet Boarding and Daycare",
    description: "Give your pet a home away from home with our boarding and daycare services.",
    petBusinessId: 6,
    category: "PET_BOARDING",
    basePrice: 35.0,
    tagIds: [{ tagId: 2 }],
    addressIds: [],
    duration: 1440, // 24 hours
  },
  {
    id: 13,
    title: "Cat Grooming Special",
    description: "Pamper your feline friend with our cat grooming services.",
    petBusinessId: 7,
    category: "PET_GROOMING",
    basePrice: 60.0,
    tagIds: [],
    addressIds: [],
    duration: 45,
  },
  {
    id: 14,
    title: "Dog Walking Adventure",
    description: "Let our experienced dog walkers take your furry friend on an exciting adventure!",
    petBusinessId: 7,
    category: "PET_RETAIL",
    basePrice: 30.0,
    tagIds: [{ tagId: 4 }],
    addressIds: [],
    duration: 60,
  },
  {
    id: 15,
    title: "Pet Photography Session",
    description: "Capture beautiful moments with your pets in a professional photoshoot.",
    petBusinessId: 7,
    category: "PET_RETAIL",
    basePrice: 75.0,
    tagIds: [{ tagId: 3 }],
    addressIds: [],
    duration: 120,
  },
  {
    id: 16,
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
    const createObject = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      duration: data.duration,
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
    
    if (data.attachmentKeys && data.attachmentURLs) {
      createObject.attachmentKeys = data.attachmentKeys;
      createObject.attachmentURLs = data.attachmentURLs;
    }

    // Check if data.calendarGroupId exists before adding it to createObject
    if (data.calendarGroupId) {
      createObject.CalendarGroup = {
        connect: { calendarGroupId: data.calendarGroupId },
      };
    }

    await prisma.serviceListing.upsert({
      where: { serviceListingId: data.id },
      update: {},
      create: createObject,
    });
  }
}

module.exports = { serviceListings, tags, seedBusinessData };
