const { FeaturedListingCategoryEnum } = require("@prisma/client");
const prisma = require("../../../../prisma/prisma");
const { getPreviousWeekDates } = require("../../../utils/date");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");

// This method will get the top n service listings ordered between startDate and endDate by quantity
// Results are ordered by quantity ordered in descending order
// EG [ 3, 4, 14, 1, 10 ] --> SL with id 3 was purchased the most, and SL with id 10 was purchased the least
exports.getHottestListingsInATimePeriod = async (startDate, endDate, n) => {
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
    // Select the top n service listings with the highest order count and extract the service listing IDs
    const nHottestListingsIds = sortedServiceListingsIds
      .slice(0, n)
      .map((entry) => entry[0]);

    return nHottestListingsIds;

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
      select: {
        serviceListingId: true, 
      },
    });

    const expiringListingIds = expiringListings.map((listing) => listing.serviceListingId);
    return expiringListingIds;
  } catch (error) {
    console.error("Error fetching expiring service listings in a specified time period:", error);
    throw new ServiceListingError(error);
  }
};

// This method will get the top n service listings that have been favourited by the most users
exports.getTopFavoritedListings = async (n) => {
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

    // Select the top `n` listings with the highest favoriting count and extract the IDs
    const topFavoritedListingIds = sortedListings
      .slice(0, n)
      .map((entry) => entry[0]);

    return topFavoritedListingIds;

  } catch (error) {
    console.error("Error fetching top favorited service listings:", error);
    throw new ServiceListingError(error);
  }
};

// This method will get the top n service listings that have been created between startDate and endDate, that already have users favouriting or purchasing it
exports.getRisingNewListings = async (startDate, endDate, n) => {
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
  
      // Select the top N most promising new listings and extract the IDs
      let topListingIds = sortedListings.slice(0, n).map((entry) => entry[0]);
  
      // Query the actual service listings based on the IDs
      const risingListings = await prisma.serviceListing.findMany({
        where: {
          serviceListingId: {
            in: topListingIds,
          },
          dateCreated: {
            gte: startDate,
            lte: endDate,
        },
        },
      });
      topListingIds = risingListings.map((listing) => listing.serviceListingId);
      return topListingIds;

    } catch (error) {
      console.error("Error fetching most promising new listings:", error);
      throw new ServiceListingError(error);
    }
};

exports.createFeaturedListingSetForTimePeriod = async (currentDate, startDate, endDate, n) => {
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
      let listings = [];

      switch (category) {
        case FeaturedListingCategoryEnum.HOTTEST_LISTINGS:
          listings = await exports.getHottestListingsInATimePeriod(lastWeekStart, lastWeekEnd, n);
          break;
        case FeaturedListingCategoryEnum.ALMOST_GONE:
          listings = await exports.getExpiringListingsInATimePeriod(currentDate, endDate, n);
          break;
        case FeaturedListingCategoryEnum.ALL_TIME_FAVS:
          listings = await exports.getTopFavoritedListings(n);
          break;
        case FeaturedListingCategoryEnum.RISING_LISTINGS:
          listings = await exports.getRisingNewListings(lastWeekStart, lastWeekEnd, n);
          break;
        default:
          break;
      }
      createdFeaturedListingSetMap[category] = await exports.createFeaturedListing(category, startDate, endDate, listings);
    }

    console.log('Featured Listing Sets created successfully');
    return createdFeaturedListingSetMap;

  } catch (error) {
    console.error('Error creating featured listing sets:', error);
    throw new Error('Error creating featured listing sets');
  }
};

exports.createFeaturedListing = async (category, startDate, endDate, serviceListingIds) => {
  try {
    const listings = await prisma.serviceListing.findMany({
      where: {
        serviceListingId: { in: serviceListingIds },
      },
    });

    const featuredListing = await prisma.featuredListingSet.create({
      data: {
        category: category,
        validityPeriodStart: startDate,
        validityPeriodEnd: endDate,
        serviceListings: {
          connect: listings.map((serviceListing) => ({ serviceListingId: serviceListing.serviceListingId })),
        },
      },
      include: {
        serviceListings: true, 
      },
    });
    return featuredListing;
  } catch (error) {
    console.error(`Error creating featured listing for ${category}:`, error);
    throw new Error(`Error creating featured listing for ${category}`);
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
    throw new Error("Error fetching FeaturedListingSet by ID");
  }
};

exports.getFeaturedListingSetsByDateRange = async (startDate, endDate) => {
  try {
    const featuredListingSets = await prisma.featuredListingSet.findMany({
      where: {
        validityPeriodStart: {
          gte: startDate,
        },
        validityPeriodEnd: {
          lte: endDate,
        },
      },
    });

    return featuredListingSets;
  } catch (error) {
    console.error("Error fetching FeaturedListingSets by date range:", error);
    throw new Error("Error fetching FeaturedListingSets by date range");
  }
};
  
  