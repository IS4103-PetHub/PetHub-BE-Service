const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");
const { deleteServiceListingEmail } = require("../../resource/emailTemplate");
const EmailService = require("../emailService");
const s3ServiceInstance = require("../s3Service");
const { getAllAddressesForPetBusiness } = require("../user/addressService");


exports.createServiceListing = async (data) => {
  try {
    // Ensure that pet business exists
    const petBusiness = await prisma.user.findUnique({
      where: { userId: data.petBusinessId },
    });
    if (!petBusiness) {
      throw new CustomError(
        "Pet business not found or pet business ID is not valid",
        404
      );
    }

    let tagIdsArray = [], addressIdsArray = [];
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    if (data.tagIds) {
      tagIdsArray =  data.tagIds.map((id) => ({ tagId: id }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(
        data.petBusinessId
      );
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (
        !data.addressIds.every((id) => validAddressIds.includes(id))
      ) {
        throw new CustomError(
          "Addresses tagged to service listing should be a subset of parent pet business's address list!",
          400
        );
      }
      addressIdsArray = data.addressIds.map((id) => ({
        addressId: id,
      }));
    }

    if (data.duration && (data.duration < 0 || data.duration > 180)) {
      throw new CustomError(
        "Addresses tagged to service listing should be a subset of parent pet business's address list!",
        400
      );
    }

    const serviceListingData = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      attachmentURLs: data.attachmentURLs,
      attachmentKeys: data.attachmentKeys,
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
    
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    let tagIdsArray = [],
      addressIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: id }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(
        serviceListing.petBusinessId
      );
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (!data.addressIds.every((id) => validAddressIds.includes(id))) {
        throw new CustomError(
          "Addresses tagged to service listing should be a subset of parent pet business's address list!",
          400
        );
      }
      addressIdsArray = data.addressIds.map((id) => ({ addressId: id }));
    }
    if (data.duration && (data.duration < 0 || data.duration > 180)) {
      throw new CustomError(
        "Addresses tagged to service listing should be a subset of parent pet business's address list!",
        400
      );
    }

    const serviceListingData = {
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      attachmentURLs: data.attachmentURLs,
      attachmentKeys: data.attachmentKeys,
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
// 2 types of listings:
// - PB that created this listing has an 'ACTIVE' account status
// - In the future, if we choose to allow PB to "deactivate" their service listings, we can edit this method to only include service listings that have 'ACTIVE' state
exports.getAllServiceListingsAvailableForPetOwners = async () => {
  try {
    return await prisma.serviceListing.findMany({
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
      },
    });
  } catch (error) {
    console.error("Error fetching all active service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.getServiceListingById = async (serviceListingId) => {
  try {
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId },
      include: {
        tags: true,
        addresses: true,
        petBusiness: true,
        CalendarGroup: true
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

exports.filterServiceListing = async (categories, tags) => {
  try {
    const serviceListings = await prisma.serviceListing.findMany({
      where: {
        OR: [
          {
            tags: {
              some: {
                name: {
                  in: tags,
                },
              },
            },
          },
          {
            category: {
              in: categories,
            },
          },
        ],
      },
      include: {
        tags: true,
        petBusiness: {
          select: {
            companyName: true,
          },
        },
      },
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.deleteServiceListing = async (serviceListingId, callee) => {
  // TODO: Add logic to check for existing unfulfilled orders when order management is done
  // Current logic: Disasicaite a particular service listing from existing connections (tag, PB) and delete
  try {
    // Send deletion email if INTERNAL_USER is the one that deleted the service listing
    if (callee.accountType == "INTERNAL_USER") {
      const listingToDelete = await this.getServiceListingById(serviceListingId);
      await this.sendDeleteServiceListingEmail(listingToDelete.petBusiness.companyName, listingToDelete.petBusiness.businessEmail, listingToDelete.title);
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

