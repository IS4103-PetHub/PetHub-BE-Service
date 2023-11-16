const fetch = require("node-fetch");
const s3ServiceInstance = require("../../../src/api/services/s3Service");
const { getRandomFutureDate, getRandomPastDate } = require("../../../src/utils/date");
const { v4: uuidv4 } = require("uuid");

const CURRENT_DATE = new Date();
const tags = [
  {
    id: 1,
    name: "Eco-friendly",
  },
  {
    id: 2,
    name: "New",
  },
  {
    id: 3,
    name: "Seasonal",
  },
  {
    id: 4,
    name: "Exercise",
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

const groomingAllURLs = [
  "https://img.freepik.com/free-photo/cute-pet-collage-isolated_23-2150007407.jpg?w=740&t=st=1700031072~exp=1700031672~hmac=86248383e10cf1e0e52ca855aeef9e7d84a39045e1f9ed7c703ea4773b147e80",
  "https://img.freepik.com/free-photo/haircuting-process-small-dog-sits-table-dog-with-professional_1157-48819.jpg?w=826&t=st=1700097736~exp=1700098336~hmac=bb2392a930a8bf27cc54c6ab7a225b1e4a81e551f43332007ccffc04ad91d0c4",
  "https://img.freepik.com/premium-photo/funny-wet-jack-russell-puppy-after-bath-wrapped-towel-freshly-washed-cute-dog-with-soap-suds-his-head-yellow-background-high-quality-photo_96727-2015.jpg?w=826",
  "https://img.freepik.com/premium-photo/vet-examining-dog-cat_119439-711.jpg?w=826",
  "https://img.freepik.com/free-photo/washing-pet-dog-home_23-2149627259.jpg?w=826&t=st=1700097765~exp=1700098365~hmac=607353966aff7024b659cfd69155571575123d2e86531a2c841e61cdd5afdf9b",
  "https://img.freepik.com/free-photo/white-fluffy-cat-veterinarian-with-cats-animals-couch_1157-46552.jpg?w=826&t=st=1700097779~exp=1700098379~hmac=e7f30ccab2c60c7ddd169fbadca34f95ac8b59ef486b1ae1825aefecb2e151ca",
  "https://img.freepik.com/free-photo/brown-rabbit-couch-veterinarian-trims-claws-doctors-gloves_1157-46564.jpg?w=826&t=st=1700097790~exp=1700098390~hmac=55cc9dd7bfa49dcd024a544318187ee9662612325e4b352b5a4bcaf904f39194",
  "https://img.freepik.com/premium-photo/female-groomer-wipes-cute-little-dog-with-towel-washing-procedure-grooming-salon_266732-8229.jpg?w=826",
  "https://img.freepik.com/free-photo/washing-pet-dog-home_23-2149627253.jpg?w=826&t=st=1700097809~exp=1700098409~hmac=856cbbe6754a66f8a2731701f73184259284b084376dd775d6074df7b96444e8",
  "https://img.freepik.com/premium-photo/cute-wet-white-cute-cat-after-bathing-wrapped-blue-towel-pink-terry-cap-his-head_116578-1531.jpg",
  "https://img.freepik.com/free-photo/cat-getting-procedure-groomer-salon-young-woman-white-tshirt-combing-little-cat-white-brown-cat-blue-table_1157-51511.jpg?t=st=1700097831~exp=1700098431~hmac=c6b52a44766940f23b76dfd78a7879389cc9982f989493e2798143d1833b13d0",
]

const boardingAllURLs = [
  "https://img.freepik.com/premium-photo/asian-woman-with-welsh-corgi-pembroke-dog_64030-591.jpg?w=826",
  "https://img.freepik.com/premium-photo/human-hands-dog-paw-top-view_143092-4083.jpg?w=826",
  "https://img.freepik.com/free-photo/beautiful-pet-portrait-small-dog-with-cage_23-2149218437.jpg?w=996&t=st=1700097991~exp=1700098591~hmac=d66361c35566141774ed8751c10c0788a5b35d627d73531e783100288940c7b9",
  "https://img.freepik.com/free-photo/side-view-woman-with-cute-dog_23-2150209136.jpg?w=826&t=st=1700097994~exp=1700098594~hmac=cfe6fbd55351b3b96bd8c7b4b74e31d541820c71da2e4fad6e2f9f5f3bb8332f",
  "https://nekoya.co/wp-content/uploads/2019/09/Select-Trustworthy-Hotel.png",
  "https://nekoya.co/wp-content/uploads/2016/11/cat-playing-tips-to-choosing-cat-boarding-hotel-singapore-1.jpg",
  "https://nekoya.co/wp-content/uploads/2019/09/Cat-Exclusive-Environment.png",
  "https://assets-global.website-files.com/606e96048e07f8de3d446a0b/62fb52eb93696234a44e9271_WMCkTfXY9u6LK-_DuCNl7yJQRXYk_018LT4y2egJK4sHQb8SEBfhWEAJ-9DNuNhcDQ4nx60-AodAjPCldZipNjWePQe6ET_KTBR9q22I18vTqzrVp-RLOQOo1fy-dyMZvvSwOYaZ11JNl2JhP2QHcI8.png",
  "https://assets-global.website-files.com/606e96048e07f8de3d446a0b/62fca4d781de9f6164b09227_h_AiqYKT-vjlFm0pRly2zuO2fLwcpdh_pyHr9dzj-_3w0izXQfHi0MAvXR0EedFoC37vJ_URqkW3jdk_yngBug5A0W1JF9K9nyAxwcSxDC5Pg2284Nt0Y6VTvDzfBH5gRgQhrSDNyGE5Bl5wu_jdHaQ.png",
  "https://cdn.shopify.com/s/files/1/0558/3316/5987/files/Untitled_design.jpg?v=1656304494"
]

const trainingAllURLs = [
  "https://www.madeterra.com/wp-content/uploads/2020/10/training-bunny-sit-with-you.webp",
  "https://www.hartz.com/wp-content/uploads/2021/10/Dog-Training-Basics-2.jpg",
  "https://media-be.chewy.com/wp-content/uploads/How-to-leash-train-your-rabbitHERO.jpg",
  "https://img.freepik.com/free-photo/young-woman-doing-yoga-her-dog_23-2148991876.jpg?w=826&t=st=1700101179~exp=1700101779~hmac=208c0e81b60b311458e353987c7a9a0520e66cd01b2ac31fff04fbb3ecccbf02",
  "https://img.freepik.com/free-photo/beautiful-cat-home_23-2149304107.jpg?w=826&t=st=1700101212~exp=1700101812~hmac=969c45ff80a432d4580eb257e62d53a85b93efbd0c19e0781846fbf4252942bd",
  "https://plus.unsplash.com/premium_photo-1686523494950-e3b291024aad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://media.cnn.com/api/v1/images/stellar/prod/221017154341-06-search-and-rescue-rats-apopo.jpg?c=original&q=h_778,c_fill",
  "https://i.dailymail.co.uk/1s/2022/06/03/12/58636035-10881699-Scientists_are_training_rats_to_find_earthquake_survivors_while_-a-37_1654255434546.jpg",
  "https://www.hillspet.co.id/content/dam/cp-sites/hills/hills-pet/global/articles/cat-care/thumbnails/HP_PCC_md_cat_training_2.jpg.rendition.678.340.jpg",
  "https://www.hillspet.co.id/content/dam/cp-sites/hills/hills-pet/global/articles/cat-care/thumbnails/HP_PCC_md_cat_training_1.jpg.rendition.678.340.jpg",
  "https://cdn.onemars.net/sites/dreamies_sg_lxXUo_r9CA/image/5-tips-to-train-your-cat_1667916437335.png",
]

const vetAllURLs = [
  "https://img.freepik.com/free-photo/close-up-veterinarian-taking-care-dog_23-2149100178.jpg?w=826&t=st=1700098362~exp=1700098962~hmac=89aa7b1155611914a88c5176437614a2c825f9b77cedef40244681da5363a8e7",
  "https://img.freepik.com/free-photo/close-up-veterinarian-taking-care-dog_23-2149100223.jpg?w=826&t=st=1700098370~exp=1700098970~hmac=b09851d901d56157e68bc9c1db116b8e829902976b771d0697d108ccb4d4cf85",
  "https://img.freepik.com/free-photo/close-up-veterinarian-taking-care-cat_23-2149100166.jpg?w=826&t=st=1700098382~exp=1700098982~hmac=5c25915bc66d5963e9ec825eef4654202f3f055937886aab0cec16c9d89c3dee",
  "https://img.freepik.com/free-photo/close-up-doctor-checking-cat-s-belly_23-2149304292.jpg?w=826&t=st=1700098388~exp=1700098988~hmac=4b819e5fe2ba7c6d6e9ae3f71f0d3ced53153e2ff30b0d434b6126f1bfe3ba76",
  "https://smallpetselect.com/wp-content/uploads/2022/02/shutterstock_1847533180-2048x1356.jpg",
  "https://scontent.fsin11-1.fna.fbcdn.net/v/t1.18169-9/23795173_10155685049561006_970930271672068089_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9a8829&_nc_ohc=S6zRePwdSQwAX9e2Iux&_nc_oc=AQnsR6XioZ07Sic4uyjM129EHs0EvJWtNfxoRoG-BWxEgftn7o5aXPQPxZHf55D60dg&_nc_ht=scontent.fsin11-1.fna&oh=00_AfAkDCu14ZtfKd1L9qBXknHjrDrEgClYnsLIigQW_3htdQ&oe=657CDAE5",
  "https://orewabeachvetclinic.co.nz/wp-content/uploads/2021/06/caring-for-your-rat-orewa-beach-vet-1200x562.jpg",
  "https://d2alru2r30ax77.cloudfront.net/become-a-vet/_pageGallery/Sea-turtle-radiograph-gallery-web.jpg",
  "https://d2alru2r30ax77.cloudfront.net/become-a-vet/_pageGallery/Veterinarian-Turtle-exam-gallery-web.jpg",
  "https://marinesavers.com/wordpress/wp-content/uploads/2022/08/Katrina-turtle-veterinary-care-at-Marine-Savers-Maldives-1080.jpg",
  "https://marinesavers.com/wordpress/wp-content/uploads/2022/07/Frisbee-male-Olive-Ridley-rescue-turtle-Maldives-2-1080.jpg",
  "https://d2zp5xs5cp8zlg.cloudfront.net/image-54043-340.jpg",
]
const dogURLs = [
  "https://img.freepik.com/free-photo/close-up-view-beautiful-dog-with-bow-tie_23-2148786566.jpg?w=740&t=st=1700031089~exp=1700031689~hmac=5a0f2468b2128c016dd6ebaeb358a72cbe1fb9dc85624fdf31d95dbfe3c977bd",
  "https://img.freepik.com/free-photo/veterinarian-taking-care-pet-dog_23-2149198639.jpg?w=826&t=st=1700031119~exp=1700031719~hmac=4db3511a9ce087eb549f8ba7ff45af54ac4a7cef828b5c21d59d0215e85c4adf",
  "https://img.freepik.com/free-photo/adorable-chihuahua-dog-with-female-owner_23-2149880096.jpg?w=826&t=st=1700031146~exp=1700031746~hmac=04da2aa633bac13a5ce644a32d6946dab11e2098259b7cbd3447a50be4c88496",
  "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://img.freepik.com/free-photo/cute-dog-biting-flip-flop_23-2149544896.jpg?w=826&t=st=1700097552~exp=1700098152~hmac=0e8d6cff6514c6abb02a5d76216f130a62bdce2f4152e532a73092cf1b7ad560",
  "https://img.freepik.com/free-photo/washing-pet-dog-home_23-2149627229.jpg?w=826&t=st=1700097560~exp=1700098160~hmac=03b809a83d63c30bc95bbf658af9d377c5e21721aeb8b412fbc8f59f25424f5f",
  "https://images.unsplash.com/photo-1600169337065-c5b0102ca06d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1535930749574-1399327ce78f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

]

const catURLs = [
  "https://plus.unsplash.com/premium_photo-1661888521670-7dc228bcd78b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1555008872-f03b347ffb53?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://nekoya.co/wp-content/uploads/2016/11/cat-playing-tips-to-choosing-cat-boarding-hotel-singapore-1.jpg",
  "https://nekoya.co/wp-content/uploads/2019/09/Cat-Exclusive-Environment.png",
  "https://i0.wp.com/catcaresolutions.com/wp-content/uploads/2020/12/cute-cat-with-yellow-headband-on.png?fit=1000%2C1500&ssl=1",
  "https://images.pexels.com/photos/4587959/pexels-photo-4587959.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/4588069/pexels-photo-4588069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/1909802/pexels-photo-1909802.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
]

const reptileURLs = [
  "https://usfwsnortheast.files.wordpress.com/2013/07/turtle-release-8_6-19-07-closeup.jpg",
  "https://images.unsplash.com/photo-1556227834-c4b0b0f7d533?q=80&w=2059&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://d2alru2r30ax77.cloudfront.net/become-a-vet/_pageGallery/Sea-turtle-radiograph-gallery-web.jpg",
  "https://d2alru2r30ax77.cloudfront.net/become-a-vet/_pageGallery/Veterinarian-Turtle-exam-gallery-web.jpg",
  "https://marinesavers.com/wordpress/wp-content/uploads/2022/08/Katrina-turtle-veterinary-care-at-Marine-Savers-Maldives-1080.jpg",
  "https://marinesavers.com/wordpress/wp-content/uploads/2022/07/Frisbee-male-Olive-Ridley-rescue-turtle-Maldives-2-1080.jpg",
]

const rabbitURLs = [
  "https://img.freepik.com/free-photo/side-view-women-holding-bunnies_23-2149514622.jpg?w=826&t=st=1700031052~exp=1700031652~hmac=67670b7ecdee1e01fe017bc42d50ba7ef6e75a4b57524ee6654774c207d64913",
  "https://d2zp5xs5cp8zlg.cloudfront.net/image-54043-340.jpg",
  "https://dims.apnews.com/dims4/default/ed6d2d7/2147483647/strip/true/crop/3000x2000+0+0/resize/1440x960!/format/webp/quality/90/?url=https%3A%2F%2Fstorage.googleapis.com%2Fafs-prod%2Fmedia%2Fe5ed326091ae46a18a1f15cac3e61e36%2F3000.jpeg",
  "https://www.scmagazine.com/_next/image?url=https%3A%2F%2Ffiles.scmagazine.com%2Fwp-content%2Fuploads%2F2022%2F01%2FGettyImages-137876949.jpg&w=750&q=75",
  "https://npr.brightspotcdn.com/dims4/default/5096441/2147483647/strip/true/crop/1600x1165+0+0/resize/1760x1282!/format/webp/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F77%2F24%2F29756c5244d39d1d32ab5f15ac87%2F51540497220-6a66f4310d-h.jpg",
]

const birdURLs = [
  "https://www.tracyvets.com/files/Cockatiel.jpeg",
  "https://petkeen.com/wp-content/uploads/2021/08/Eagle-side-view_Steve-Boise_Shutterstock-760x507.jpg",
  "https://www.washingtonpost.com/blogs/going-out-guide/files/2018/01/IMG_7915-1024x768.jpg",
  "https://www.washingtonpost.com/blogs/going-out-guide/files/2018/01/IMG_E1230-1024x768.jpg",
  "https://hips.hearstapps.com/hmg-prod/images/best-pet-birds-lead-1572839035.jpg?crop=1.00xw:0.761xh;0,0.0386xh&resize=1200:*",
]

const serviceListings = [
  {
    id: 1,
    title: "Professional Pet Grooming",
    description:
      "Professional Pet Grooming offers top-quality pet grooming services for your beloved furry friend. Our dedicated team of experienced groomers is passionate about making your pet look and feel their best. We provide a range of grooming services, including bathing, nail trimming, ear cleaning, and haircuts, all designed to keep your pet clean, healthy, and happy. Our state-of-the-art grooming facility is equipped with the latest tools and equipment to ensure the safety and comfort of your pet during the grooming process. We use only premium, pet-friendly grooming products to ensure that your pet's skin and coat remain in excellent condition. At Professional Pet Grooming, we understand that every pet is unique, and we tailor our services to meet their specific needs. Whether your pet is a dog or a cat, a small breed or a large one, we provide personalized care to ensure they leave looking and feeling their best. Book an appointment with us today, and let us pamper your pet with the care and attention they deserve. Your furry friend will thank you for it!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 15.0,
    tagIds: [{ tagId: 1 }, { tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 1,
    requiresBooking: true,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 2,
    title: "Dog Training Session",
    description:
      "Dog Training Session provides expert dog training to teach your pet new tricks. Our dedicated trainers are skilled in working with dogs of all breeds and ages. Whether your dog needs basic obedience training or advanced trick training, we have a program that suits their needs. Our training sessions are designed to be fun and engaging for your pet while ensuring they learn valuable skills. We use positive reinforcement techniques to encourage good behavior and strengthen the bond between you and your furry friend. With Dog Training Session, you'll have a well-behaved and happy dog in no time. Join our training classes and watch your pet's confidence and abilities grow!",
    petBusinessId: 1,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 23.5,
    tagIds: [{ tagId: 2 }, { tagId: 3 }, { tagId: 4 }],
    addressIds: [{ addressId: 2 }],
    duration: 60,
    calendarGroupId: 4,
    requiresBooking: true,
    url: getRandomImageURLs(trainingAllURLs)
  },
  {
    id: 3,
    title: "Normal grooming waterslide experience",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 12.0,
    tagIds: [{ tagId: 1 }, { tagId: 4 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 1,
    requiresBooking: true,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 4,
    title: "Routine Pet Health Checkup",
    description: "Ensure your pet's well-being with our thorough health checkup",
    petBusinessId: 1,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 5.0,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    duration: 60,
    addressIds: [{ addressId: 1 }, { addressId: 2 }],
    calendarGroupId: 3,
    requiresBooking: true,
    url: getRandomImageURLs(vetAllURLs)
  },
  {
    id: 5,
    title: "Reliable Pet Sitting Service",
    description: "Trustworthy pet sitting services for your beloved pets",
    petBusinessId: 4,
    category: "PET_BOARDING",
    lastPossibleDate: "2023-11-10T15:59:59.999Z",
    basePrice: 20.5,
    tagIds: [{ tagId: 1 }, { tagId: 2 }],
    duration: 60,
    addressIds: [{ addressId: 6 }],
    requiresBooking: false,
    defaultExpiryDays: 30,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 6,
    title: "Cat Adoption Event",
    description: "Find your purr-fect feline friend at our cat adoption event",
    petBusinessId: 5,
    category: "PET_RETAIL",
    lastPossibleDate: "2023-12-30T15:59:59.999Z",
    basePrice: 0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 7 }, { addressId: 8 }],
    duration: 60,
    requiresBooking: false,
    defaultExpiryDays: 14,
    url: getRandomImageURLs(catURLs)
  },
  {
    id: 7,
    title: "Adopt a Pet Today",
    description:
      "Adopt a Pet Today is your golden opportunity to embark on a heartwarming journey of discovering your perfect furry companion at our extraordinary adoption event. We proudly collaborate with local animal shelters, forging invaluable partnerships that allow us to present you with an irresistibly diverse selection of cats and dogs, each yearning for the love and warmth of a forever home.\n\nOur adoption process is not just simple; it's a straightforward path paved with compassion and care, making your journey to find a new pet as effortless as it is rewarding. Whether your heart desires the playful antics of a frisky kitten or the unwavering loyalty of a devoted canine companion, rest assured that our adoption center has a plethora of charming and charismatic pets eagerly waiting to make your acquaintance.\n\nOne of the most remarkable aspects of Adopt a Pet Today is our commitment to affordability. We firmly believe that love knows no price tag, and every pet deserves a chance to find a loving family. That's why our adoption fees are exceptionally reasonable, ensuring that you can open your heart and home to a deserving pet without breaking the bank.\n\nBut our dedication doesn't stop there. We go the extra mile to ensure that every pet who leaves our adoption center is equipped for a bright future. Before they become a part of your family, each of our pets undergoes essential medical care. They are spayed or neutered to help control the pet population and reduce the number of homeless animals. Our dedicated veterinary team administers vaccinations to keep your new companion in the pink of health. Additionally, we take the critical step of microchipping every pet, providing an extra layer of security to reunite lost pets with their loving owners.\n\nWhen you visit Adopt a Pet Today, you're not just finding a new best friend; you're giving a homeless pet a second chance at a happy, fulfilling life. It's a heartwarming journey filled with love, compassion, and boundless joy. Your decision to adopt a pet from our event is a powerful testament to your commitment to making the world a better place for animals in need.\n\nCome, be a part of this beautiful journey, and let us guide you toward your new best friend. Visit Adopt a Pet Today, where love knows no bounds, and where the extraordinary adventure of pet adoption begins.",
    petBusinessId: 5,
    category: "PET_RETAIL",
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
    url: getRandomImageURLs(dogURLs)
  },
  {
    id: 8,
    title: "VIP grooming ninja offering",
    description: "Treat your pets to a day of grooming by VIP groomers!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    basePrice: 14.5,
    tagIds: [{ tagId: 4 }, { tagId: 5 }],
    addressIds: [],
    duration: 60,
    calendarGroupId: 2,
    requiresBooking: true,
    defaultExpiryDays: 14,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 9,
    title: "John's new vet experiment",
    description: "Hi, my name is John and I just got my vet license, let's put it to the test!",
    petBusinessId: 1,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 8.0,
    tagIds: [{ tagId: 2 }, { tagId: 3 }],
    addressIds: [{ addressId: 1 }],
    duration: 60,
    calendarGroupId: 3,
    requiresBooking: true,
    url: getRandomImageURLs(vetAllURLs)
  },
  {
    id: 10,
    title: "Dog Sitting with John",
    description:
      "Enjoy peace of mind knowing that your dog is in good hands with John. Whether it's for a few hours or an evening, your dog will receive personalized attention and care. We'll make sure your dog feels comfortable and happy while you're away. Book a dog sitting session with us, and let your furry companion have a great time with John!",
    petBusinessId: 1,
    category: "PET_BOARDING",
    basePrice: 15.0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 1 }],
    duration: 180,
    calendarGroupId: 5,
    requiresBooking: true,
    defaultExpiryDays: 14,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 11,
    title: "Terrapin Care by Sarah",
    description: "Experienced terrapin care services by Sarah. Your terrapins will be in safe hands.",
    petBusinessId: 2,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 10.0,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 12,
    title: "Bird Grooming with Mary",
    description: "Professional bird grooming services by Mary. Keep your birds happy and healthy.",
    petBusinessId: 3,
    category: "PET_GROOMING",
    defaultExpiryDays: 45,
    basePrice: 13.5,
    requiresBooking: false,
    url: getRandomImageURLs(birdURLs)
  },
  {
    id: 13,
    title: "Rabbit Boarding by Alex",
    description: "Trust your rabbits with Alex for a comfortable and secure boarding experience.",
    petBusinessId: 4,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 7.0,
    requiresBooking: false,
    url: getRandomImageURLs(rabbitURLs)
  },
  {
    id: 14,
    title: "Cat Adoption Center",
    description: "Find loving homes for cats at our adoption center. Adopt a furry friend today!",
    petBusinessId: 5,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 0.0, 
    requiresBooking: false, 
    url: getRandomImageURLs(catURLs)
  },
  {
    id: 15,
    title: "Reptile Care Services",
    description: "Comprehensive care services for reptiles. Ensure your reptiles are healthy and happy.",
    petBusinessId: 2,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 17.0,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 16,
    title: "Pet Sitting for All",
    description: "Your trusted pet sitting service. We care for dogs, cats, birds, and more!",
    petBusinessId: 3,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 20.0,
    requiresBooking: false,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 17,
    title: "Small Mammal Boarding",
    description: "Boarding services for small mammals like hamsters, guinea pigs, and more.",
    petBusinessId: 4,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 18,
    title: "Terrapin Tank Maintenance",
    description: "Professional tank maintenance services to keep your aquatic pets healthy.",
    petBusinessId: 5,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 5.0,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 19,
    title: "Exotic Pet Care",
    description: "Specialized care services for exotic pets. We handle unique and rare animals with care.",
    petBusinessId: 1,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 25.0,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 20,
    title: "Pet Spa and Grooming",
    description: "Treat your pets to a day of pampering and grooming at our pet spa. They deserve it!",
    petBusinessId: 2,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 33.0,
    requiresBooking: false,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 21,
    title: "Cat Grooming Paradise",
    description: "Top-notch grooming services for your beloved cats. Make them feel purr-fect!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 12.0,
    requiresBooking: false,
    url: getRandomImageURLs(catURLs)
  },
  {
    id: 22,
    title: "Pet-Friendly Cafe",
    description: "Enjoy a cup of coffee while your furry friend socializes with other pets at our cafe.",
    petBusinessId: 2,
    category: "DINING",
    defaultExpiryDays: 30,
    basePrice: 10.0,
    requiresBooking: false,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 23,
    title: "Veterinary Checkup",
    description: "Routine checkup and healthcare services for your pets by experienced veterinarians.",
    petBusinessId: 3,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 8.5,
    requiresBooking: true,
    url: getRandomImageURLs(vetAllURLs)
  },
  {
    id: 24,
    title: "Pet Toys and Accessories",
    description:
      "Explore a wide range of toys and accessories for your pets. Keep them entertained and happy.",
    petBusinessId: 4,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 9.0,
    requiresBooking: false,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 25,
    title: "Luxury Rabbit Boarding",
    description: "Luxurious accommodations and personalized care for your rabbits while you're away.",
    petBusinessId: 5,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 10.0,
    requiresBooking: true,
    url: getRandomImageURLs(rabbitURLs)
  },
  {
    id: 26,
    title: "Terrapin Pampering Package",
    description: "Indulge your Terrapin with a spa day and grooming session. They'll love it!",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 17.0,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 27,
    title: "Pet-Friendly Restaurant",
    description:
      "Dine with your pets in our outdoor pet-friendly seating area. A meal for you and your furry companions!",
    petBusinessId: 2,
    category: "DINING",
    defaultExpiryDays: 30,
    basePrice: 25.0,
    requiresBooking: false,
    url: getRandomImageURLs(dogURLs)
  },
  {
    id: 28,
    title: "Emergency Veterinary Care",
    description: "24/7 emergency veterinary services to ensure your pet's well-being at all times.",
    petBusinessId: 3,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 20.0,
    requiresBooking: true,
    url: getRandomImageURLs(vetAllURLs)
  },
  {
    id: 29,
    title: "Pet Apparel and Fashion",
    description:
      "Dress up your pets in the latest pet fashion trends. Find the perfect outfit for every occasion.",
    petBusinessId: 4,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 30,
    title: "Bird Boarding Services",
    description:
      "Safe and comfortable boarding services for your feathered friends while you're on vacation.",
    petBusinessId: 5,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 10.0,
    requiresBooking: true,
    url: getRandomImageURLs(birdURLs)
  },
  {
    id: 31,
    title: "Reptile Grooming",
    description: "Grooming and spa services tailored to the unique needs of your reptilian pets.",
    petBusinessId: 1,
    category: "PET_GROOMING",
    defaultExpiryDays: 30,
    basePrice: 16.75,
    requiresBooking: false,
    url: getRandomImageURLs(reptileURLs)
  },
  {
    id: 32,
    title: "Pet-Friendly Bistro",
    description: "A bistro that serves delicious meals for both pet and pet owner. A culinary delight!",
    petBusinessId: 2,
    category: "DINING",
    defaultExpiryDays: 30,
    basePrice: 15.0,
    requiresBooking: false,
    url: getRandomImageURLs(boardingAllURLs)
  },
  {
    id: 33,
    title: "Holistic Pet Care",
    description: "Holistic healthcare and wellness services for pets. Nurture their body, mind, and spirit.",
    petBusinessId: 3,
    category: "VETERINARY",
    defaultExpiryDays: 30,
    basePrice: 7.75,
    requiresBooking: true,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 34,
    title: "Pet Photography Studio",
    description:
      "Capture the beauty and personality of your pets with our professional pet photography services.",
    petBusinessId: 4,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 18.9,
    requiresBooking: false,
    url: getRandomImageURLs(birdURLs)
  },
  {
    id: 35,
    title: "Pet Training and Obedience",
    description: "Train your pets to be well-behaved and obedient with our expert pet training services.",
    petBusinessId: 5,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 23.5,
    requiresBooking: true,
    url: getRandomImageURLs(trainingAllURLs)
  },

  // This service listings (id 36-37) have requiresBooking: true but no CG
  // On the customer side, pet owners should not be able to see these listings as this SL is invalid.
  {
    id: 36,
    title: "Normal grooming fun times",
    description: "Treat your pets to a day of grooming by regular groomers!",
    petBusinessId: 2,
    category: "PET_GROOMING",
    basePrice: 13.0,
    tagIds: [{ tagId: 3 }, { tagId: 5 }],
    addressIds: [{ addressId: 3 }],
    duration: 60,
    requiresBooking: true,
    defaultExpiryDays: 14,
    url: getRandomImageURLs(groomingAllURLs)
  },
  {
    id: 37,
    title: "Puppy Training Class",
    description: "Join our fun and interactive puppy training class!",
    petBusinessId: 3,
    category: "PET_BOARDING",
    defaultExpiryDays: 30,
    basePrice: 20.0,
    tagIds: [{ tagId: 1 }, { tagId: 5 }],
    addressIds: [],
    duration: 90,
    requiresBooking: true,
    url: getRandomImageURLs(trainingAllURLs)
  },
  // This service listing (id 38) will have a lastPossibleDate to be < currentDate
  // On the customer side, pet owners should not be able to see these listings as the SL is already invalid.
  {
    id: 38,
    title: "Pet Photography Session",
    description: "Capture beautiful moments with your pets in a professional photoshoot.",
    petBusinessId: 2,
    category: "PET_RETAIL",
    defaultExpiryDays: 30,
    basePrice: 5.0,
    tagIds: [{ tagId: 3 }],
    addressIds: [],
    url: getRandomImageURLs(rabbitURLs)
  },
  {
    id: 39,
    title: "John Dog supplements",
    description:
      "Elevate your dogs health with Johns premium Dog Supplements We offer a wide range of quality supplements to keep your furry friend in top shape Choose from a variety of options to support your dogs wellbeing Give your dog the care they deserve with our topnotch products.",
    petBusinessId: 1,
    category: "PET_RETAIL",
    basePrice: 5.0,
    tagIds: [{ tagId: 2 }, { tagId: 4 }],
    addressIds: [{ addressId: 1 }],
    defaultExpiryDays: 30,
    requiresBooking: false,
    url: getRandomImageURLs(dogURLs)
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

    const images = [];
    for (const imageURL of data.url) {
      const file = await remoteImageUrlToFile(imageURL, uuidv4);
      images.push(file);
    }
    const key = await s3ServiceInstance.uploadImgFiles(images, "service-listing");
    const url = await s3ServiceInstance.getObjectSignedUrl(key);

    const randomCount = Math.floor(Math.random() * 6) + 1;
    const petOwnerIds = generateRandomPetOwnerIds(randomCount, 9, 18); // Generate randomCount unique random pet owner IDs from a range of 9 - 18
    const createObject = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      duration: data.duration,
      requiresBooking: data.requiresBooking,
      dateCreated: getRandomPastDate(CURRENT_DATE, 14), // get a random date between the current date and a date 2 weeks ago
      lastPossibleDate: getRandomFutureDate(CURRENT_DATE), // get a random future date, between 0-4 weeks from the current date
      listingTime: getRandomPastDate(CURRENT_DATE, 14), // lisitng was bumped between (dateCreated and current_dates)
      defaultExpiryDays: data.defaultExpiryDays,
      attachmentURLs: url,
      attachmentKeys: key,
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
      favouritedUsers: {
        connect: petOwnerIds.map((ownerId) => ({ userId: ownerId })),
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
      case 39:
        createObject.attachmentKeys = sittingKey;
        createObject.attachmentURLs = sittingUrl;
        createObject.lastPossibleDate = pastDate;
        break;
      default:
        break;
    }

    // This is to test the bumped listings carousell
    // These listings have the most recent listingTime as they are "just" (most newly) created, but even with the most recent listingTime,
    // It shouldnt aappear in the bumped listings carousell as only bumped listings should appear in that carousell
    // These should appear at the top of the marketplace (AKA View all listings page)
    if (data.id % 5 == 0) {
      createObject.dateCreated = CURRENT_DATE;
      createObject.listingTime = CURRENT_DATE;
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

// UTILITY METHODS
function generateRandomPetOwnerIds(count, min, max) {
  const randomIds = new Set();

  while (randomIds.size < count) {
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    randomIds.add(randomId);
  }

  return Array.from(randomIds);
}

function getRandomImageURLs(arr) {
  // Shuffle the array to get a random order of images
  const shuffled = arr.sort(() => Math.random() - 0.5);
  const randomImageURLS = shuffled.slice(0, 2);

  return randomImageURLS;
}


module.exports = { serviceListings, tags, seedBusinessData, remoteImageUrlToFile };
