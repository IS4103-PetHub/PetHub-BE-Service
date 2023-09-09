const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");

exports.createServiceListing = async (data) => {
  try {
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    let tagIdsArray = [];
    if (data.tagIds) {
      tagIdsArray = data.tagIds
        .split(",")
        .map((id) => ({ tagId: parseInt(id.trim(), 10) }));
    }
    const serviceListing = await prisma.serviceListing.create({
      data: {
        title: data.title,
        description: data.description,
        basePrice: Number(data.basePrice),
        category: data.category,
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
    let tagIdsArray = [];
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    if (data.tagIds) {
      tagIdsArray = data.tagIds
        .split(",")
        .map((id) => ({ tagId: parseInt(id.trim(), 10) }));
    }
    const updatedListing = await prisma.serviceListing.update({
      where: { serviceListingId },
      data: {
        title: data.title,
        description: data.description,
        basePrice: Number(data.basePrice),
        category: data.category,
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
    });
    return serviceListings;
  } catch (error) {
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};
