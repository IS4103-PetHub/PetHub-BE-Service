const articleService = require('../services/article/articleService');
const articleValidation = require('../validations/articleValidation')
const BaseValidations = require("../validations/baseValidation");
const constants = require("../../constants/common");
const s3ServiceInstance = require('../services/s3Service');
const errorMessages = constants.errorMessages;

exports.getAllArticle = async (req, res, next) => {
    try {
        const articleType = req.query.articleType;
        if (articleType && !articleValidation.validateArticleType(articleType))
            return res.status(400).json({ message: "invalid articleType" })

        const articles = await articleService.getAllArticle(articleType)
        res.status(200).json(articles)
    } catch (error) {
        next(error)
    }
}

exports.getArticleById = async (req, res, next) => {
    try {
        const articleId = req.params.id;
        if (!(await BaseValidations.isValidInteger(articleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const article = await articleService.getArticleById(Number(articleId));
        res.status(200).json(article)
    } catch (error) {
        next(error)
    }
}

exports.deleteArticle = async (req, res, next) => {
    try {
        const articleId = req.params.id;
        if (!(await BaseValidations.isValidInteger(articleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        await articleService.deleteArticle(Number(articleId))
        res.status(200).json("Article successfully deleted")
    } catch(error) {
        next(error)
    }
}

exports.createArticle = async (req, res, next) => {
    try {
        const payload = req.body;
        const validationResult = articleValidation.validateCreateAndUpdateArticlePayload(payload)
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {
            payload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "article")
            payload.attachmentUrls = await s3ServiceInstance.getObjectSignedUrl(payload.attachmentKeys)
        }
        const { internalUserId, ...payloadWithoutId } = payload;

        const newArticle = await articleService.createArticle(payloadWithoutId, Number(internalUserId))
        res.status(201).json(newArticle)
    } catch(error) {
        next(error)
    }
}

exports.updateArticle = async (req, res, next) => {
    try {
        const articleId = req.params.id;
        if (!(await BaseValidations.isValidInteger(articleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const payload = req.body;
        const validationResult = articleValidation.validateCreateAndUpdateArticlePayload(payload)
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {

            await articleService.deleteFilesOfAnArticle(
                Number(articleId)
            )

            payload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "article")
            payload.attachmentUrls = await s3ServiceInstance.getObjectSignedUrl(payload.attachmentKeys)
        }
        const { internalUserId, ...payloadWithoutId } = payload;
        const updatedArticle = await articleService.updateArticle(payloadWithoutId, Number(articleId), Number(internalUserId))
        res.status(200).json(updatedArticle)
    } catch(error) {
        next(error)
    }
}