const { FeaturedListingCategoryEnum } = require("@prisma/client");
const prisma = require("../../../../prisma/prisma");
const { getPreviousWeekDates } = require("../../../utils/date");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");
const { getServiceListingById, isServiceListingValid } = require("./baseServiceListing");

// This function should return the set of featured listings for a certain time period.
// For simplicity, lets take startDate and endDate as the validity period of this featuredListings --> These featured listings are valid to be shown from startDate to endDate
// Start date can be known as day 1, end date can be known as day 7
exports.getFeaturedListingsForTimePeriod = async (currentDate, startDate, endDate, n) => {
  try {
    const { lastWeekStart, lastWeekEnd } = getPreviousWeekDates(startDate, endDate);
    const categories = [
      FeaturedListingCategoryEnum.HOTTEST_LISTINGS,
      FeaturedListingCategoryEnum.ALMOST_GONE,
      FeaturedListingCategoryEnum.ALL_TIME_FAVS,
      FeaturedListingCategoryEnum.RISING_LISTINGS,
    ];
    const createdFeaturedListingSetMap = {};
    for (const category of categories) {
      let listingIdToDescriptionMap = [];

      switch (category) {
        case FeaturedListingCategoryEnum.HOTTEST_LISTINGS:
          // Find hottest listings last week --> from day -6 to day 0
          listingIdToDescriptionMap = await exports.getHottestListingsInATimePeriod(lastWeekStart, lastWeekEnd);
          break;
        case FeaturedListingCategoryEnum.ALMOST_GONE:
          // Find listings that are expiring this week --> from currentDate to day 7
          listingIdToDescriptionMap = await exports.getExpiringListingsInATimePeriod(currentDate, endDate);
          break;
        case FeaturedListingCategoryEnum.ALL_TIME_FAVS:
          listingIdToDescriptionMap = await exports.getTopFavoritedListings();
          break;
        case FeaturedListingCategoryEnum.RISING_LISTINGS:
          // Find listings that were created and already popular last week --> created last week --> from day -6 to day 0
          listingIdToDescriptionMap = await exports.getRisingNewListings(lastWeekStart, lastWeekEnd);
          break;
        default:
          break;
      }
      createdFeaturedListingSetMap[category] = await exports.createFeaturedListingSet(category, startDate, endDate, listingIdToDescriptionMap, n);
    }

    console.log('Featured Listing Sets created successfully');
    return createdFeaturedListingSetMap;

  } catch (error) {
    console.error('Error creating featured listing sets:', error);
    throw new CustomError('Error creating featured listing sets');
  }
};

exports.createFeaturedListingSet = async (category, startDate, endDate, listingIdToDescriptionMap, n) => {
  try {
    // Create the FeaturedListingSet
    let featuredListingSet = await prisma.featuredListingSet.create({
      data: {
        category: category,
        validityPeriodStart: startDate,
        validityPeriodEnd: endDate,
      }
    });

    // Slice to get top n (listingIdToDescriptionMap is already sorted)
    const sortedMap = Array.from(listingIdToDescriptionMap.entries()).slice(0, n);

    // Create FeaturedListing entities
    for (const [serviceListingId, description] of sortedMap) {
      await prisma.featuredListing.create({
        data: {
          description: description,
          serviceListing: {
            connect: {
              serviceListingId: serviceListingId, 
            }
          },
          featuredListingSet: {
            connect: {
              id: featuredListingSet.id, 
            },
          },
        },
      });
    }
    featuredListingSet = await prisma.featuredListingSet.findUnique({
      where: {
        id: featuredListingSet.id,
      },
      include: {
        featuredListings: {
          include: {
            serviceListing: {
              include: {
                tags: true,
                addresses: true,
                petBusiness: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return featuredListingSet;
  } catch (error) {
    console.error(`Error creating featured listing for ${category}:`, error);
    throw new CustomError(`Error creating featured listing for ${category}`);
  }
};

exports.getFeaturedListingSetById = async (featuredListingSetId) => {
  try {
    const featuredListingSet = await prisma.featuredListingSet.findUnique({
      where: { id: featuredListingSetId },
    });

    return featuredListingSet;
  } catch (error) {
    console.error("Error fetching FeaturedListingSet by ID:", error);
    throw new CustomError("Error fetching FeaturedListingSet by ID");
  }
};

exports.getFeaturedListingSetsByDateRange = async (startDate, endDate) => {
  try {
    const featuredListingSets = await prisma.featuredListingSet.findMany({
      where: {
        validityPeriodStart: { gte: startDate },
        validityPeriodEnd: { lte: endDate },
      },
      include: {
        featuredListings: {
          include: {
            serviceListing: {
              include: {
                tags: true,
                addresses: true,
                petBusiness: {
                  select: {
                    companyName: true,
                    user: {
                      select: {
                        accountStatus: true,
                      },
                    },
                  },
                },
                CalendarGroup: true
              },
            },
          },
        },
      },
    });

    return featuredListingSets;
  } catch (error) {
    console.error("Error fetching FeaturedListingSets by date range:", error);
    throw new CustomError("Error fetching FeaturedListingSets by date range");
  }
};

// DATA PROCESSING METHODS
  
// This method will get the top n service listings ordered between startDate and endDate by quantity
// Results are ordered by quantity ordered in descending order
// EG [ 3, 4, 14, 1, 10 ] --> SL with id 3 was purchased the most, and SL with id 10 was purchased the least
// Returns a map of serviceListingId --> description, EG. { 1 => '5 listings sold last week!',  14 => '4 listings sold last week!' }
exports.getHottestListingsInATimePeriod = async (startDate, endDate) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: {
          select: { serviceListingId: true }
        },
      },
    });

    // Create a map to count how many times each service listing was ordered
    const orderCountMap = new Map();

    for (const invoice of invoices) {
      for (const orderItem of invoice.orderItems) {
        const serviceListingId = orderItem.serviceListingId;
        if (orderCountMap.has(serviceListingId)) {
          orderCountMap.set(serviceListingId, (orderCountMap.get(serviceListingId) + 1));
        } else {
          orderCountMap.set(serviceListingId, 1);
        }
      }
    }

    // Sort the service listings by order count in descending order
    const sortedServiceListingsIds = Array.from(orderCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    // map service listing IDs to descriptions
    const hottestListingsWithDescriptions = new Map();
    sortedServiceListingsIds.forEach(([serviceListingId, orderCount]) => {
      const description = `${orderCount} listings sold last week!`;
      hottestListingsWithDescriptions.set(serviceListingId, description);
    });

    return hottestListingsWithDescriptions; 

  } catch (error) {
    console.error("Error fetching hottest service listings in a specified time period:", error);
    throw new ServiceListingError(error);
  }
};

// This method will get the service listings that are expiring between the currentDate and endDate
exports.getExpiringListingsInATimePeriod = async (currentDate, endDate) => {
  try {
    const expiringListings = await prisma.serviceListing.findMany({
      where: {
        lastPossibleDate: {
          gte: currentDate, 
          lte: endDate, 
        },
      },
      orderBy: {
        lastPossibleDate: 'asc', // Sort by lastPossibleDate in ascending order
      },
      select: {
        serviceListingId: true, 
        lastPossibleDate: true,
      },
    });

    // Create a map of listingId to description
    const listingsWithDescriptions = new Map();
    expiringListings.forEach((listing) => {
      const serviceListingId = listing.serviceListingId;
      const lastPossibleDate = listing.lastPossibleDate.toLocaleDateString(undefined, { day: "numeric", month: "short" });
      const description = `Hurry! Expiring ${lastPossibleDate}!`;
      listingsWithDescriptions.set(serviceListingId, description);
    });

    return listingsWithDescriptions;
  } catch (error) {
    console.error("Error fetching expiring service listings in a specified time period:", error);
    throw new ServiceListingError(error);
  }
};

// This method will get the top service listings that have been favourited by the most users
exports.getTopFavoritedListings = async () => {
  try {
    // Query all pet owners along with their favorite listings and associated users
    const petOwners = await prisma.petOwner.findMany({
      include: {
        favouriteListings: true,
        user: {
          select: { accountStatus: true },
        },
      },
    });

    // Create a map to count how many users have favorited each listing
    const favoritedCountMap = new Map();

    petOwners.forEach((petOwner) => {
      // Ensure that the associated user is active
      if (petOwner.user.accountStatus === "ACTIVE") {
        petOwner.favouriteListings.forEach((listing) => {
          const listingId = listing.serviceListingId;
          if (favoritedCountMap.has(listingId)) {
            favoritedCountMap.set(listingId, (favoritedCountMap.get(listingId) + 1));
          } else {
            favoritedCountMap.set(listingId, 1);
          }
        });
      }
    });

    // Sort the listings by favoriting count in descending order
    const sortedListings = Array.from(favoritedCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    // Map listing IDs to descriptions
    const topFavoritedListingsWithDescriptions = new Map();
    sortedListings.forEach(([listingId, favoritedCount]) => {
      const description = `Favourited by ${favoritedCount} users!`;
      topFavoritedListingsWithDescriptions.set(listingId, description);
    });

    return topFavoritedListingsWithDescriptions;

  } catch (error) {
    console.error("Error fetching top favourited service listings:", error);
    throw new ServiceListingError(error);
  }
};

// This method will get the top service listings that have been created between startDate and endDate, that already have users favouriting or purchasing it
exports.getRisingNewListings = async (startDate, endDate) => {
    try {
      // Query favorited listings of pet owners and apply date filtering
      const favoritedListings = await prisma.petOwner.findMany({
        include: {
          favouriteListings: {
            where: {
              dateCreated: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: { serviceListingId: true },
          },
        },
      });
  
      // Query invoices created between the specified start and end dates and apply date filtering
      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          orderItems: {
            select: { serviceListingId: true },
          },
        },
      });
  
      // Extract service listing IDs from favorited listings and order items
      const favoritedListingIds = favoritedListings.flatMap(
        (petOwner) => petOwner.favouriteListings.map((listing) => listing.serviceListingId)
      );
      const invoiceListingIds = invoices.flatMap(
        (invoice) => invoice.orderItems.map((item) => item.serviceListingId)
      );
  
      // Combine favorited and invoiced service listing IDs
      const combinedListingIds = [...favoritedListingIds, ...invoiceListingIds];
  
      // Count the occurrences of each service listing ID
      const listingCountMap = new Map();
      combinedListingIds.forEach((id) => {
        listingCountMap.set(id, (listingCountMap.get(id) || 0) + 1);
      });
  
      // Sort the service listings by count in descending order
      const sortedListings = Array.from(listingCountMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      // Create a map of listingId to description
      const risingListingsWithDescriptions = new Map();
      sortedListings.forEach(([listingId, count]) => {
        const description = `Favourited or bought ${count} times!`;
        risingListingsWithDescriptions.set(listingId, description);
      });

      return risingListingsWithDescriptions;

    } catch (error) {
      console.error("Error fetching rising listings:", error);
      throw new ServiceListingError(error);
    }
};
