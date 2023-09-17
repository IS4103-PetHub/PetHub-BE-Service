const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const ServiceListingError = require("../../errors/serviceListingError");
const { deleteFiles } = require("../s3Service");
const { getAllAddressesForPetBusiness } = require("../user/addressService");

exports.createServiceListing = async (data) => {
  try {
    // Ensure that pet business exists
    const petBusiness = await prisma.user.findUnique({
      where: { userId: parseInt(data.petBusinessId) },
    });
    if (!petBusiness) {
      throw new CustomError(
        "Pet business not found or pet business ID is not valid",
        404
      );
    }

    let tagIdsArray = [],
      addressIdsArray = [];
    // format as "[{ tagId: 8 }, { tagId: 9 }, { tagId: 10 }]"
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    if (data.tagIds) {
      tagIdsArray = data.tagIds.map((id) => ({ tagId: parseInt(id) }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(
        Number(data.petBusinessId)
      );
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (
        !data.addressIds.every((id) => validAddressIds.includes(parseInt(id)))
      ) {
        throw new CustomError(
          "Addresses tagged to service listing should be a subset of parent pet business's address list!",
          400
        );
      }
      addressIdsArray = data.addressIds.map((id) => ({
        addressId: parseInt(id),
      }));
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
        addresses: {
          connect: addressIdsArray,
        },
        petBusiness: {
          connect: {
            userId: Number(data.petBusinessId),
          },
        },
      },
      include: {
        tags: true,
        addresses: true,
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
      tagIdsArray = data.tagIds.map((id) => ({ tagId: parseInt(id) }));
    }
    if (data.addressIds) {
      // validate that data.addressIds is a subset of petBusiness's addresses
      const validAddresses = await getAllAddressesForPetBusiness(
        serviceListing.petBusinessId
      );
      const validAddressIds = validAddresses.map((a) => a.addressId);
      if (
        !data.addressIds.every((id) => validAddressIds.includes(parseInt(id)))
      ) {
        throw new CustomError(
          "Addresses tagged to service listing should be a subset of parent pet business's address list!",
          400
        );
      }
      addressIdsArray = data.addressIds.map((id) => ({
        addressId: parseInt(id),
      }));
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
          set: [],
          connect: tagIdsArray,
        },
        addresses: {
          set: [],
          connect: addressIdsArray,
        },
        lastUpdated: new Date(),
      },
      include: {
        tags: true,
        addresses: true,
      },
    });

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
        addresses: true,
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
    console.error("Error fetching all service listings:", error);
    throw new ServiceListingError(error);
  }
};

exports.deleteServiceListing = async (serviceListingId) => {
  // TODO: Add logic to check for existing unfulfilled orders when order management is done
  // Current logic: Disasicaite a particular service listing from existing connections (tag, PB) and delete
  try {
    await this.deleteFilesOfAServiceListing(serviceListingId);
    await prisma.serviceListing.delete({
      where: { serviceListingId },
    });
  } catch (error) {
    console.error("Error deleting service listing:", error);
    if (error instanceof CustomError) {
      throw error;
    }
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
      throw error;
    }
    throw new ServiceListingError(error);
  }
};
