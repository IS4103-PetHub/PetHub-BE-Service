const BaseValidations = require("../validations/baseValidation");
const TagService = require("../services/serviceListing/tagService");
const constants = require("../../constants/common");
const limitations = constants.limitations;
const errorMessages = constants.errorMessages;

exports.createTag = async (req, res, next) => {
  try {
    const data = req.body;
    if (
      !(await BaseValidations.isValidLength(data.name, limitations.TAG_LENGTH))
    ) {
      return res.status(400).json({
        message: errorMessages.INVALID_TAG,
      });
    }
    const tag = await TagService.createTag(data);
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const updateData = req.body;
    const tagId = req.params.id;
    if (!(await BaseValidations.isValidInteger(tagId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    if (
      !(await BaseValidations.isValidLength(
        updateData.name,
        limitations.TAG_LENGTH
      ))
    ) {
      return res.status(400).json({
        message: errorMessages.INVALID_TAG,
      });
    }

    const updatedTag = await TagService.updateTag(Number(tagId), req.body);
    res.status(200).json(updatedTag);
  } catch (error) {
    next(error);
  }
};

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await TagService.getAllTags();
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

exports.getTagById = async (req, res, next) => {
  try {
    const tagId = req.params.id;
    if (!(await BaseValidations.isValidInteger(tagId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const tag = await TagService.getTagById(Number(tagId));
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const tagId = req.params.id;
    if (!(await BaseValidations.isValidInteger(tagId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    await TagService.deleteTag(Number(tagId));
    res.status(200).json("Tag successfully deleted");
  } catch (error) {
    next(error);
  }
};
