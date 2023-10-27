const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");
const { deleteServiceListingEmail } = require("../../resource/emailTemplate");
const EmailService = require("../emailService");
const s3ServiceInstance = require("../s3Service");
const { getAllAddressesForPetBusiness } = require("../user/addressService");
const { getHottestListingsInATimePeriod, getMostPromisingNewListings } = require("./featuredServiceListing");


exports.createServiceListing = async (data) => {
  try {
    // Ensure that pet business exists
    const petBusiness = await prisma.user.findUnique({
      where: { userId: data.petBusinessId },
    });
    if (!petBusiness || petBusiness.accountType != "PET_BUSINESS") {
      throw new CustomError(
        "User not found, or id is not tagged to a valid pet business user account",
        404
      );
    }

    let tagIdsArray = [], addressIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: id }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(data.petBusinessId);
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (!data.addressIds.every((id) => validAddressIds.includes(id))) {
        throw new CustomError("Addresses tagged to service listing should be a subset of parent pet business's address list!", 400);
      }
      addressIdsArray = data.addressIds.map((id) => ({ addressId: id }));
    }

    if (data.duration && (data.duration < 0 || data.duration > 180)) {
      throw new CustomError("Duration should be between 0 - 180 minutes", 400);
    }

    const serviceListingData = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      attachmentURLs: data.attachmentURLs,
      attachmentKeys: data.attachmentKeys,
      requiresBooking: data.requiresBooking,
      defaultExpiryDays: data.defaultExpiryDays,
      lastPossibleDate: data.lastPossibleDate ? data.lastPossibleDate : null,
      duration: data.duration ? data.duration : null,
      tags: {
        connect: tagIdsArray,
      },
      addresses: {
        connect: addressIdsArray,
      },
      petBusiness: {
        connect: {
          userId: data.petBusinessId,
        },
      },
    };

    if (data.calendarGroupId) {
      serviceListingData.CalendarGroup = {
        connect: {
          calendarGroupId: data.calendarGroupId,
        },
      };
    }

    const serviceListing = await prisma.serviceListing.create({
      data: serviceListingData,
      include: {
        tags: true,
        addresses: true,
        CalendarGroup: true, // This will include CalendarGroup only if it was added conditionally
      },
    });
    return serviceListing;
  } catch (error) {
    console.error("Error during service listing creation:", error);
    if (error instanceof CustomError) throw error;
    throw new ServiceListingError(error);
  }
};

exports.updateServiceListing = async (serviceListingId, data) => {
  try {
    // Ensure that service listing exists
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId: serviceListingId },
    });
    if (!serviceListing) {
      throw new CustomError("Service listing not found", 404);
    }
    
    let tagIdsArray = [], addressIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: id }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(serviceListing.petBusinessId);
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (!data.addressIds.every((id) => validAddressIds.includes(id))) {
        throw new CustomError("Addresses tagged to service listing should be a subset of parent pet business's address list!", 400);
      }
      addressIdsArray = data.addressIds.map((id) => ({ addressId: id }));
    }
    if (data.duration && (data.duration < 0 || data.duration > 180)) {
      throw new CustomError("Duration should be between 0 - 180 minutes", 400);
    }

    const serviceListingData = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      attachmentURLs: data.attachmentURLs,
      attachmentKeys: data.attachmentKeys,
      requiresBooking: data.requiresBooking,
      defaultExpiryDays: data.defaultExpiryDays,
      lastPossibleDate: data.lastPossibleDate ? data.lastPossibleDate : null,
      duration: data.duration ? data.duration : null,
      tags: {
        set: [],
        connect: tagIdsArray,
      },
      addresses: {
        set: [],
        connect: addressIdsArray,
      },
      lastUpdated: new Date()
    }

    if (data.calendarGroupId) {
      serviceListingData.CalendarGroup = {
        connect: {
          calendarGroupId: data.calendarGroupId
        }
      }
    }

    const updatedListing = await prisma.serviceListing.update({
      where: { serviceListingId },
      data: serviceListingData,
      include: {
        tags: true,
        addresses: true,
        CalendarGroup: true
      },
    });

    return updatedListing;
  } catch (error) {
    console.error("Error during service listing creation:", error);
    if (error instanceof CustomError) throw error;
    throw new ServiceListingError(error);
  }
};

exports.getAllServiceListings = async () => {
  try {
    return await prisma.serviceListing.findMany({
      include: {
        tags: true,
        addresses: true,
        petBusiness: {
          select: {
            companyName: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

// Function will return all service listings that can be accessed by pet owners (customers) and booked.
// 3 types of listings:
// - PB that created this listing has an 'ACTIVE' account status
// - SL must be VALID. Conditions: 
//     - for SLs that requiresBookings, the CG and duration is NOT null
//     - SL's lastPossibleDate >= current date 
// - In the future, if we choose to allow PB to "deactivate" their service listings, we can edit this method to only include service listings that have 'ACTIVE' state
exports.getAllServiceListingsAvailableForPetOwners = async (categories, tags, limit) => {
  try {
    const currentDate = new Date();
    const serviceListings = await prisma.serviceListing.findMany({
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
      },
      where: {
        petBusiness: {
          user: {
            accountStatus: 'ACTIVE', // pet business cannot be an inactive or pending user
          },
        },
        lastPossibleDate: {
          gte: currentDate, // Filter listings with lastPossibleDate >= current date
        },
      },
    });
    const filteredListings = filterValidListingsForPetOwners(serviceListings, categories, tags, limit);
    filteredListings.sort((a, b) => b.dateCreated - a.dateCreated);
    return filteredListings

  } catch (error) {
    console.error("Error fetching all active service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.getServiceListingById = async (serviceListingId, showCommissionRule = false) => {
  try {
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId },
      include: {
        tags: true,
        addresses: true,
        petBusiness: {
          include: {
            user: {
              select: {
                userId: true,
                email: true,
                accountType: true,
                accountStatus: true,
                dateCreated: true,
                lastUpdated: true,
              },
            },
            commissionRule: showCommissionRule
          },
        },
        CalendarGroup: true,
        reviews: {
          include: {
            orderItem: {
              select: {
                invoice: {
                  select: {
                    PetOwner: {
                      select: {
                        firstName: true,
                        lastName: true,
                        reportRevivew: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });
    if (!serviceListing) {
      throw new CustomError("Service listing not found", 404);
    }
    return serviceListing;
  } catch (error) {
    console.error("Error fetching service listing by ID:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new ServiceListingError(error);
    }
  }
};

exports.getServiceListingByCategory = async (categoryInput) => {
  try {
    const serviceListings = await prisma.serviceListing.findMany({
      where: { category: categoryInput },
      include: {
        tags: true,
        addresses: true,
        CalendarGroup: true
      },
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching service listings by category:", error);
    throw new ServiceListingError(error);
  }
};

// get all service listings with this tag in its list of tags
exports.getServiceListingByTag = async (id) => {
  try {
    const serviceListings = await prisma.serviceListing.findMany({
      where: {
        tags: {
          some: {
            tagId: id,
          },
        },
      },
      include: {
        tags: true,
        addresses: true,
        CalendarGroup: true
      },
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.getServiceListingByPBId = async (id) => {
  try {
    const serviceListings = await prisma.serviceListing.findMany({
      where: { petBusinessId: id },
      include: {
        tags: true,
        addresses: true,
      },
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching service listings by pet business ID:", error);
    throw new ServiceListingError(error);
  }
};

// This method will give recommended listings based on a PO. It recommends based off:
// 1. Pets --> recommend listings that include the PO's pets' petTypes in the title or description
// 2. Past Orders --> based on the most recent purchase, recommend SLs from the same category
// 3. Popular Listings --> If user do not have pets or past orders, recommend popular listings within the past week
// To prevent slow rendering speed, slice the list to only include 6 results
exports.getRecommendedListings = async (petOwnerId) => {
  try {
    // Get the pet owner by ID
    const petOwner = await prisma.petOwner.findUnique({
      where: { userId: petOwnerId },
      include: {
        pets: true,
        invoices: {
          include: {
            orderItems: {
              select: { serviceListingId: true },
            },
          },
        },
      },
    });
    if (!petOwner) {
      throw new CustomError("Pet Owner not found, or id is not tagged to a valid Pet Owner!", 404);
    }
    const recommendedListings = [];

    // Check if the pet owner has pets and recommend listings that include the PO's pets' petTypes in the title or description
    if (petOwner.pets.length > 0) {
      const petTypes = petOwner.pets.map((pet) => pet.petType);

      // Search for service listings with the petType in title or description
      const petTypeListings = await prisma.serviceListing.findMany({
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
        },
        where: {
          OR: petTypes.map((type) => ({
            OR: [
              {
                title: {
                  contains: type,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: type,
                  mode: "insensitive",
                },
              },
            ],
          })),
        },
      });
      recommendedListings.push(...petTypeListings);
    }

    // based on the most recent purchase, recommend SLs from the same category
    let mostRecentPurchase = null;
    for (const invoice of petOwner.invoices) {
      if (!mostRecentPurchase || invoice.dateCreated > mostRecentPurchase.dateCreated) {
        mostRecentPurchase = invoice;
      }
    }

    if (mostRecentPurchase) {
      // Get the first order item from the most recent purchase
      const orderItem = mostRecentPurchase.orderItems[0]; 

      if (orderItem) {
        const serviceListingId = orderItem.serviceListingId;

        // Get the service listing and its category
        const serviceListing = await prisma.serviceListing.findUnique({
          where: { serviceListingId },
        });
        const category = serviceListing.category;

        // Search for service listings in the same category
        const categoryListings = await prisma.serviceListing.findMany({
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
          },
          where: {
            category: category,
            NOT: { serviceListingId: { in: recommendedListings.map((listing) => listing.serviceListingId) } },
          },
        });
        // Add category listings to recommendations
        recommendedListings.push(...categoryListings);
      }
    }

    // If user do not have pets or past orders, recommend popular listings within the past week
    if (recommendedListings.length < 5) {
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
      const hottestListingsIds = await getHottestListingsInATimePeriod(startDate, endDate, 5);
      const hottestListings = await prisma.serviceListing.findMany({
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
        },
        where: {
          serviceListingId: {
            in: hottestListingsIds,
          },
        },
      });
      recommendedListings.push(...hottestListings);
    }

    // Emsure listings are valid
    let validRecommendedListings = filterValidListingsForPetOwners(recommendedListings, [], [], null);

    // If still no valid recommended listing, just get 6 random valid listings
    if (validRecommendedListings.length == 0) {
      validRecommendedListings = await this.getAllServiceListingsAvailableForPetOwners([], [], 6)
    }

    // Return the first 6 recommendations
    return validRecommendedListings.slice(0, 6);

  } catch (error) {
    console.error("Error getting recommended listings:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new ServiceListingError(error);
  }
};

exports.deleteServiceListing = async (serviceListingId, callee) => {
  // TODO: Add logic to check for existing unfulfilled orders when order management is done
  // Current logic: Disasicaite a particular service listing from existing connections (tag, PB) and delete
  try {
    // Send deletion email if INTERNAL_USER is the one that deleted the service listing and if petBusiness has a business email.
    if (callee.accountType == "INTERNAL_USER") {
      const listingToDelete = await this.getServiceListingById(serviceListingId);
      if (listingToDelete.petBusiness.user.email) {
        await this.sendDeleteServiceListingEmail(listingToDelete.petBusiness.companyName, listingToDelete.petBusiness.user.email, listingToDelete.title);
      }
    }

    await this.deleteFilesOfAServiceListing(serviceListingId);
    await prisma.serviceListing.delete({
      where: { serviceListingId },
    });
  } catch (error) {
    console.error("Error deleting service listing: ", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new ServiceListingError(error);
  }
};

// UTILITY METHODS

const filterValidListingsForPetOwners = (listings, categories, tags, limit) => {
  const currentDate = new Date();
  
  const filteredListings = listings.filter((listing) =>
    listing.petBusiness.user.accountStatus === 'ACTIVE' &&
    listing.lastPossibleDate >= currentDate &&
    (!listing.requiresBooking || (listing.calendarGroupId !== null && listing.duration !== null))
  );

  // Filter based on the INVALID condition:
  // INVALID if: SL requires booking and (CG == null OR duration == null)
  const validListings = filteredListings.filter((listing) =>
    (categories.length === 0 || categories.includes(listing.category)) &&
    (tags.length === 0 || tags.some((tag) => listing.tags.some((listingTag) => listingTag.name === tag))
  ));

  if (limit !== null && limit > 0) {
    return validListings.slice(0, limit);
  }

  return validListings;
};

exports.sendDeleteServiceListingEmail = async (petBusinessName, email, postTitle) => {
  try {
    const body = deleteServiceListingEmail(petBusinessName, postTitle);
    await EmailService.sendEmail(email, 'PetHub: Service Listing Deleted', body);
  } catch (error) {
    console.error("Error sending delete service listing email: ", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new ServiceListingError(error);
  }
}

exports.deleteFilesOfAServiceListing = async (serviceListingId) => {
  try {
    // delete images from S3
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId },
    });
    if (!serviceListing) {
      throw new CustomError("Service Listing not found", 404);
    }
    await s3ServiceInstance.deleteFiles(serviceListing.attachmentKeys);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new ServiceListingError(error);
  }
};
