const petLostAndFoundValidation = require('../validations/petLostAndFoundValidation')
const baseValidations = require('../validations/baseValidation')
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;
const petLostAndFoundService = require('../services/petLostAndFound/petLostAndFoundService')
const s3ServiceInstance = require("../services/s3Service.js");

exports.getAllPetLostAndFound = async (req, res, next) => {
    try {
        const requestType = req.query.requestType;
        const petLostAndFounds = await petLostAndFoundService.getAllPetLostAndFound(requestType)
        res.status(200).json(petLostAndFounds)
    } catch (error) {
        next(error)
    }
}

exports.getAllPetLostAndFoundByPOId = async (req, res, next) => {
    try {
        const petOwnerId = req.params.id;
        if (!await baseValidations.isValidInteger(petOwnerId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petOwnerId` });
        }
        const petLostAndFounds = await petLostAndFoundService.getPetLostAndFoundByPOId(petOwnerId)
        res.status(200).json(petLostAndFounds)
    } catch (error) {
        next(error)
    }
}

exports.createPetLostAndFound = async (req, res, next) => {
    try {
        const petOwnerId = req.query.petOwnerId

        if (!await baseValidations.isValidInteger(petOwnerId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petOwnerId` });
        }

        const petLostAndFoundPayload = req.body
        const validationResult = petLostAndFoundValidation.isValidCreateOrUpdatePetLostAndFoundPayload(petLostAndFoundPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        // create attachemnt keys and urls
        if (req.files) {
            petLostAndFoundPayload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "lost-and-found");
            petLostAndFoundPayload.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
                petLostAndFoundPayload.attachmentKeys
            );
        }

        const newPetLostAndFound = await petLostAndFoundService.createPetLostAndFound(petLostAndFoundPayload, Number(petOwnerId))

        res.status(201).json(newPetLostAndFound)

    } catch (error) {
        next(error)
    }
}

exports.updatePetLostAndFound = async (req, res, next) => {
    try {
        const lostAndFoundId = req.params.id

        if (!await baseValidations.isValidInteger(lostAndFoundId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petLostAndFoundId` });
        }

        const petLostAndFoundPayload = req.body
        const validationResult = petLostAndFoundValidation.isValidCreateOrUpdatePetLostAndFoundPayload(petLostAndFoundPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        // create attachemnt keys and urls
        if (req.files) {
            // delete existing files and update with new files
            await petLostAndFoundService.deleteFilesOfAPetLostAndFound(
                Number(lostAndFoundId)
            );
            petLostAndFoundPayload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "lost-and-found");
            petLostAndFoundPayload.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
                petLostAndFoundPayload.attachmentKeys
            );
        }

        const newPetLostAndFound = await petLostAndFoundService.updatePetLostAndFound(petLostAndFoundPayload, Number(lostAndFoundId))

        res.status(201).json(newPetLostAndFound)

    } catch (error) {
        next(error)
    }
}

exports.deletePetLostAndFound = async (req, res, next) => {
    try {
        const lostAndFoundId = req.params.id
        if (!await baseValidations.isValidInteger(lostAndFoundId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petLostAndFoundId` });
        }

        await petLostAndFoundService.deletePetLostAndFound(Number(lostAndFoundId))
        res.status(200).json("Pet Lost and Found successfully deleted")
    } catch(error) {
        next(error);
    }
}