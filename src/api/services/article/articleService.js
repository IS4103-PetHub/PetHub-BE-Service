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
                orderBy: {
                    dateCreated: 'desc' 
                },
                include: {
                    tags: true,
                    createdBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    },
                    updatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            })
            return articles
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async getAllPinnedArticles() {
        try {
            const pinnedArticles = await prisma.article.findMany({
                where: {
                    isPinned: true
                },
                orderBy: {
                    dateCreated: 'desc'
                },
                include: {
                    tags: true,
                    createdBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    },
                    updatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            });
            return pinnedArticles;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async getArticleById(articleId) {
        try {
            const article = await prisma.article.findUnique({
                where: { articleId },
                include: {
                    tags: true,
                    createdBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    },
                    updatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            })
            if (!article) throw new CustomError("article not found", 404)

            const selectedTags = article.tags;
            const selectedTagsFilter = selectedTags.map((tag) => (tag.tagId))

            const selectedCategory = article.category

            const recommendedServiceListings = await prisma.serviceListing.findMany({
                where: {
                    OR: [
                        {
                            tags: {
                                some: {
                                    tagId: {
                                        in: selectedTagsFilter,
                                    },
                                },
                            },
                        },
                        {
                            category: selectedCategory,
                        },
                    ],
                },
                take: 6,
                orderBy: {
                    tags: {
                        _count: 'desc',
                    },
                }
            });

            article.recommendedServices = recommendedServiceListings
            return article
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async createArticle(articlePayload, internalUserId) {
        try {
            const internalUser = await InternalUserService.getUserById(internalUserId) // validate userid

            let tagIdsArray = [];
            if (articlePayload.tagIds) {
                tagIdsArray = articlePayload.tagIds.map((id) => ({ tagId: Number(id) }));
            }

            const newArticle = await prisma.article.create({
                data: {
                    articleType: articlePayload.articleType,
                    title: articlePayload.title,
                    content: articlePayload.content,
                    isPinned: articlePayload.isPinned === "true",
                    attachmentKeys: articlePayload.attachmentKeys,
                    attachmentUrls: articlePayload.attachmentUrls,
                    createdBy: {
                        connect: {
                            userId: internalUserId
                        }
                    },
                    tags: {
                        connect: tagIdsArray
                    },
                    category: articlePayload.category
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

            let tagIdsArray = [];
            if (articlePayload.tagIds) {
                tagIdsArray = articlePayload.tagIds.map((id) => ({ tagId: Number(id) }));
            }

            const updatedArticle = await prisma.article.update({
                where: { articleId },
                data: {
                    articleType: articlePayload.articleType,
                    title: articlePayload.title,
                    content: articlePayload.content,
                    isPinned: articlePayload.isPinned === "true",
                    attachmentKeys: articlePayload.attachmentKeys,
                    attachmentUrls: articlePayload.attachmentUrls,
                    dateUpdated: new Date(),
                    updatedBy: {
                        connect: {
                            userId: internalUserId
                        }
                    },
                    tags: {
                        set: [],
                        connect: tagIdsArray
                    },
                    category: articlePayload.category
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
            await this.deleteFilesOfAnArticle(articleId)
            await prisma.article.delete({
                where: { articleId }
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ArticleError(error);
        }
    }

    async deleteFilesOfAnArticle(articleId) {
        try {
            const article = await prisma.article.findUnique({
                where: { articleId }
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