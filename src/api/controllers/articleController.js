const articleService = require("../services/article/articleService");
const articleValidation = require("../validations/articleValidation");
const BaseValidations = require("../validations/baseValidation");
const constants = require("../../constants/common");
const s3ServiceInstance = require("../services/s3Service");
const errorMessages = constants.errorMessages;
const { getUserFromToken } = require("../../utils/nextAuth");

exports.getAllArticle = async (req, res, next) => {
  try {
    const articleType = req.query.articleType;
    if (articleType && !articleValidation.validateArticleType(articleType))
      return res.status(400).json({ message: "invalid articleType" });

    const articles = await articleService.getAllArticle(articleType);
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

exports.getAllPinnedArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllPinnedArticles();
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    if (!(await BaseValidations.isValidInteger(articleId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const article = await articleService.getArticleById(Number(articleId));
    res.status(200).json(article);
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    if (!(await BaseValidations.isValidInteger(articleId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    await articleService.deleteArticle(Number(articleId));
    res.status(200).json("Article successfully deleted");
  } catch (error) {
    next(error);
  }
};

exports.createArticle = async (req, res, next) => {
  try {
    const payload = req.body;
    const validationResult = articleValidation.validateCreateAndUpdateArticlePayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    if (req.files) {
      payload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "article");
      payload.attachmentUrls = await s3ServiceInstance.getObjectSignedUrl(payload.attachmentKeys);
    }
    const { internalUserId, ...payloadWithoutId } = payload;

    const newArticle = await articleService.createArticle(payloadWithoutId, Number(internalUserId));
    res.status(201).json(newArticle);
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    if (!(await BaseValidations.isValidInteger(articleId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const payload = req.body;
    const validationResult = articleValidation.validateCreateAndUpdateArticlePayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    if (req.files) {
      await articleService.deleteFilesOfAnArticle(Number(articleId));

      payload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "article");
      payload.attachmentUrls = await s3ServiceInstance.getObjectSignedUrl(payload.attachmentKeys);
    }
    const { internalUserId, ...payloadWithoutId } = payload;
    const updatedArticle = await articleService.updateArticle(
      payloadWithoutId,
      Number(articleId),
      Number(internalUserId)
    );
    res.status(200).json(updatedArticle);
  } catch (error) {
    next(error);
  }
};

exports.createArticleComment = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const token = req.headers["authorization"].split(" ")[1];
    const callee = await getUserFromToken(token);

    if (!callee) {
      return res.status(400).json({ message: "Unable to find request caller!" });
    } else if (callee.accountType !== "PET_OWNER") {
      return res.status(401).json({ message: "Only pet owners interact with article comments!" });
    }

    const articleId = req.params.id;
    if (!(await BaseValidations.isValidInteger(articleId))) {
      return res.status(400).json({ message: `${errorMessages.INVALID_ID}: articleId` });
    }

    const commentPayload = req.body;
    const validationResult = articleValidation.validateArticleCommentPayload(commentPayload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const comment = await articleService.createArticleComment(
      Number(articleId),
      commentPayload.comment,
      callee.userId
    );
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.updateArticleComment = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const token = req.headers["authorization"].split(" ")[1];
    const callee = await getUserFromToken(token);

    if (!callee) {
      return res.status(400).json({ message: "Unable to find request caller!" });
    }

    const articleCommentId = req.params.commentId;
    if (!(await BaseValidations.isValidInteger(articleCommentId))) {
      return res.status(400).json({ message: `${errorMessages.INVALID_ID}: articleCommentId` });
    }

    const commentPayload = req.body;
    const validationResult = articleValidation.validateArticleCommentPayload(commentPayload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const comment = await articleService.updateArticleComment(
      Number(articleCommentId),
      commentPayload.comment,
      callee.userId
    );
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteArticleComment = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const token = req.headers["authorization"].split(" ")[1];
    const callee = await getUserFromToken(token);
    if (!callee) {
      return res.status(400).json({ message: "Unable to find request caller!" });
    }

    const articleCommentId = req.params.commentId;
    if (!(await BaseValidations.isValidInteger(articleCommentId))) {
      return res.status(400).json({ message: `${errorMessages.INVALID_ID}: articleCommentId` });
    }

    await articleService.deleteArticleComment(Number(articleCommentId), callee);
    res.status(200).json("Article Comment Successfully deleted");
  } catch (error) {
    next(error);
  }
};

exports.getArticleCommentsByArticleIdAndPetOwnerId = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const token = req.headers["authorization"].split(" ")[1];
    const callee = await getUserFromToken(token);
    if (!callee) {
      return res.status(400).json({ message: "Unable to find request caller!" });
    }

    const articleId = req.params.id;
    const petOwnerId = req.query.petOwnerId;
    if (!(await BaseValidations.isValidInteger(articleId))) {
      return res.status(400).json({ message: `${errorMessages.INVALID_ID}: articleId` });
    }

    if (!(await BaseValidations.isValidInteger(petOwnerId))) {
      return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petOwnerId` });
    }

    const response = await articleService.getArticleCommentsByArticleIdAndPetOwnerId(
      Number(articleId),
      Number(petOwnerId)
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getLatestAnnouncementArticle = async (req, res, next) => {
  try {
    const article = await articleService.getLatestAnnouncementArticle();
    res.status(200).json(article);
  } catch (error) {
    next(error);
  }
};

exports.subscribeToNewsletter = async (req, res, next) => {
  try {
    const payload = req.body;
    const validationResult = articleValidation.validateNewsletterSubscriptionPayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const subscription = await articleService.subscribeToNewsletter(payload.email);
    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

exports.unsubscribeFromNewsletter = async (req, res, next) => {
  try {
    const payload = req.body;
    const validationResult = articleValidation.validateNewsletterSubscriptionPayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const subscription = await articleService.unsubscribeFromNewsletter(payload.email);
    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
};
