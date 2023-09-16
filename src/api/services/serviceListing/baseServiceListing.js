const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");
const { deleteFiles } = require("../s3Service");

exports.createServiceListing = async (data) => {
  try {
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    let tagIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: parseInt(id) }));
    }
    const serviceListing = await prisma.serviceListing.create({
      data: {
        title: data.title,
        description: data.description,
        basePrice: Number(data.basePrice),
        category: data.category,
        attachmentURLs: data.attachmentURLs,
        attachmentKeys: data.attachmentKeys,
        tags: {
          connect: tagIdsArray,
        },
        petBusiness: {
          connect: {
            userId: Number(data.petBusinessId),
          },
        },
      },
      include: {
        tags: true,
      },
    });
    return serviceListing;
  } catch (error) {
    console.error("Error during service listing creation:", error);
    throw new ServiceListingError(error);
  }
};

exports.updateServiceListing = async (serviceListingId, data) => {
  try {
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    let tagIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: parseInt(id) }));
    }
    const updatedListing = await prisma.serviceListing.update({
      where: { serviceListingId },
      data: {
        title: data.title,
        description: data.description,
        basePrice: Number(data.basePrice),
        category: data.category,
        attachmentURLs: data.attachmentURLs,
        attachmentKeys: data.attachmentKeys,
        tags: {
          // disconnect, then connect with new tags
          set: [],
          connect: tagIdsArray,
        },
        lastUpdated: new Date(),
      },
      include: {
        tags: true,
      },
    });

    if (!updatedListing) {
      throw new CustomError("Service listing not found", 404);
    }
    return updatedListing;
  } catch (error) {
    console.error("Error during service listing creation:", error);
    throw new ServiceListingError(error);
  }
};

exports.getAllServiceListings = async () => {
  try {
    return await prisma.serviceListing.findMany();
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.getServiceListingById = async (serviceListingId) => {
  try {
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId },
      include: {
        tags: true,
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
      },
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.deleteServiceListing = async (serviceListingId) => {
  // TODO: Add logic to check for existing unfulfilled orders when order management is done
  // Current logic: Disasicaite a particular service listing from existing connections (tag, PB) and delete 
  try {
    this.deleteFilesOfAServiceListing(serviceListingId)
    await prisma.serviceListing.delete({
      where: { serviceListingId },
    });
  } catch (error) {
    console.error("Error deleting service listing:", error);
    throw new ServiceListingError(error);
  }
};

exports.deleteFilesOfAServiceListing = async (serviceListingId) => {
  try {
    // delete images from S3
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { serviceListingId },
    });
    if (!serviceListing) {
      throw new CustomError("Service Listing not found", 404);
    }
    deleteFiles(serviceListing.attachmentKeys);

  } catch (error) {
    if (error instanceof CustomError) {
      throw error
    }
    throw new ServiceListingError(error);
  }
};