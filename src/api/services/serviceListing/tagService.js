const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const TagError = require("../../errors/tagError");

exports.createTag = async (data) => {
  try {
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
      },
    });
    return tag;
  } catch (error) {
    console.error("Error during tag creation:", error);
    throw new TagError(error);
  }
};

exports.updateTag = async (tagId, data) => {
  try {
    const tag = await prisma.tag.update({
      where: { tagId },
      data: {
        name: data.name,
        lastUpdated: new Date(),
      },
    });

    return tag;
  } catch (error) {
    console.error("Error during tag update:", error);
    throw new TagError(error);
  }
};

exports.getAllTags = async () => {
  try {
    return await prisma.tag.findMany();
  } catch (error) {
    console.error("Error fetching all tags:", error);
    throw new TagError(error);
  }
};

exports.getTagById = async (tagId) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { tagId },
    });
    if (!tag) {
      throw new CustomError("Tag not found", 404);
    }
    return tag;
  } catch (error) {
    console.error("Error fetching tag by ID:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new TagError(error);
    }
  }
};

// Will automatically delete existing tags from service listings
exports.deleteTag = async (tagId) => {
  try {
    await prisma.tag.delete({
      where: { tagId },
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new TagError(error);
  }
};
