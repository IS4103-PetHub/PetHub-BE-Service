const prisma = require("../../../../prisma/prisma");
const ArticleError = require("../../errors/articleError");
const CustomError = require("../../errors/customError");
const InternalUserService = require('../../services/user/internalUserService');
const s3ServiceInstance = require("../s3Service");

class ArticleService {

    constructor() { }

    async getAllArticle(articleType = undefined) {
        try {
            const articles = await prisma.article.findMany({
                where: { articleType: articleType },
            })
            return articles
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async getArticleById(articleId) {
        try {
            const article = await prisma.article.findUnique({
                where: {articleId}
            })
            if (!article) throw new CustomError("article not found", 404)
            return article
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async createArticle(articlePayload, internalUserId) {
        try {
            const internalUser = await InternalUserService.getUserById(internalUserId) // validate userid

            const newArticle = await prisma.article.create({
                data: {
                    articleType: articlePayload.articleType,
                    title: articlePayload.title,
                    content: articlePayload.content,
                    attachmentKeys: articlePayload.attachmentKeys,
                    attachmentUrls: articlePayload.attachmentUrls,
                    createdBy: {
                        connect: {
                            userId: internalUserId
                        }
                    }
                }
            })

            return newArticle
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async updateArticle(articlePayload, articleId, internalUserId) {
        try {
            const internalUser = await InternalUserService.getUserById(internalUserId) // validate userid

            const updatedArticle = await prisma.article.update({
                where: {articleId},
                data: {
                    articleType: articlePayload.articleType,
                    title: articlePayload.title,
                    content: articlePayload.content,
                    attachmentKeys: articlePayload.attachmentKeys,
                    attachmentUrls: articlePayload.attachmentUrls,
                    dateUpdated: new Date(),
                    updatedBy: {
                        connect: {
                            userId: internalUserId
                        }
                    }
                }
            })
            return updatedArticle
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async deleteArticle(articleId) {
        try {
            await prisma.article.delete({
                where: {articleId}
            });
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async deleteFilesOfAnArticle(articleId) {
        try {
            const article = await prisma.article.findUnique({
                where: {articleId}
            })
    
            if (!article) {
                throw new CustomError("article not found", 404)
            }
            await s3ServiceInstance.deleteFiles(article.attachmentKeys)
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
              }
              throw new ArticleError(error);
        }
    }

}

module.exports = new ArticleService();