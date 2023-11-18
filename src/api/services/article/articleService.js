const prisma = require("../../../../prisma/prisma");
const ArticleError = require("../../errors/articleError");
const CustomError = require("../../errors/customError");
const InternalUserService = require("../../services/user/internalUserService");
const s3ServiceInstance = require("../s3Service");
const petOwnerService = require("../../services/user/petOwnerService");
const emailService = require("../emailService");
const emailTemplate = require("../../resource/emailTemplate");
const pdf = require("html-pdf");

class ArticleService {
  constructor() {}

  async getAllArticle(articleType = undefined) {
    try {
      const articles = await prisma.article.findMany({
        where: { articleType: articleType },
        orderBy: {
          dateCreated: "desc",
        },
        include: {
          tags: true,
          articleComments: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return articles;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async getAllPinnedArticles() {
    try {
      const pinnedArticles = await prisma.article.findMany({
        where: {
          isPinned: true,
        },
        orderBy: {
          dateCreated: "desc",
        },
        include: {
          tags: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return pinnedArticles;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async getLatestAnnouncementArticle() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const latestAnnouncementArticle = await prisma.article.findFirst({
        where: {
          articleType: "ANNOUNCEMENTS",
          dateCreated: {
            gte: oneWeekAgo,
          },
        },
        orderBy: {
          dateCreated: "desc",
        },
      });
      return latestAnnouncementArticle;
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
          articleComments: {
            include: {
              petOwner: true,
            },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      if (!article) throw new CustomError("article not found", 404);

      const selectedTags = article.tags;
      const selectedTagsFilter = selectedTags.map((tag) => tag.tagId);
      const selectedCategory = article.category;

      // Fetch SLs that match the selected category
      let recommendedListings = [];
      let categoryMatchedListings;
      let tagMatchedListings;

      if (selectedCategory !== null) {
        categoryMatchedListings = await prisma.serviceListing.findMany({
          where: {
            category: selectedCategory,
            petBusiness: {
              user: {
                accountStatus: "ACTIVE", // pet business cannot be an inactive or pending user
              },
            },
            lastPossibleDate: {
              gte: new Date(), // Filter listings with lastPossibleDate >= current date
            },
          },
          include: {
            tags: true,
            petBusiness: {
              select: {
                companyName: true,
              },
            },
          },
        });

        // Sort category matched SLs by the number of matching tags
        categoryMatchedListings.sort((a, b) => {
          const aTagMatchCount = a.tags.filter((tag) => selectedTagsFilter.includes(tag.tagId)).length;
          const bTagMatchCount = b.tags.filter((tag) => selectedTagsFilter.includes(tag.tagId)).length;
          return bTagMatchCount - aTagMatchCount;
        });
      }

      // ONLY if less than 6 category matched listings (or category is null), get SLs with matching tags (but not same category if exists)
      if (!selectedCategory || categoryMatchedListings.length < 6) {
        tagMatchedListings = await prisma.serviceListing.findMany({
          where: {
            ...(selectedCategory !== null && { category: { not: selectedCategory } }),
            tags: {
              some: {
                tagId: {
                  in: selectedTagsFilter,
                },
              },
            },
          },
          include: {
            tags: true,
            petBusiness: {
              select: {
                companyName: true,
              },
            },
          },
        });

        // Sort tag matched SLs by the number of matching tags
        tagMatchedListings.sort((a, b) => {
          const aTagMatchCount = a.tags.filter((tag) => selectedTagsFilter.includes(tag.tagId)).length;
          const bTagMatchCount = b.tags.filter((tag) => selectedTagsFilter.includes(tag.tagId)).length;
          return bTagMatchCount - aTagMatchCount;
        });
      }

      // Combine SLs and take top 6
      if (
        categoryMatchedListings &&
        Array.isArray(categoryMatchedListings) &&
        categoryMatchedListings.length > 0
      ) {
        recommendedListings.push(...categoryMatchedListings);
      }
      if (tagMatchedListings && Array.isArray(tagMatchedListings) && tagMatchedListings.length > 0) {
        recommendedListings.push(...tagMatchedListings);
      }

      // Take top 6 from the combined array
      recommendedListings = recommendedListings.slice(0, 6);

      article.recommendedServices = recommendedListings;
      return article;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async createArticle(articlePayload, internalUserId) {
    try {
      const internalUser = await InternalUserService.getUserById(internalUserId); // validate userid

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
              userId: internalUserId,
            },
          },
          tags: {
            connect: tagIdsArray,
          },
          category: articlePayload.category,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          tags: true,
        },
      });

      // Send article to newsletter subscribers after req response so its non-blocking
      const subscriberEmails = (await prisma.newsletterSubscription.findMany()).map((sub) => sub.email);
      const articleToHtml = this.createHtmlTemplate(newArticle, null); // Add metadata to the original HTML content, excluding subscriber specific information
      const pdfBuffer = await this.htmlToPdf(articleToHtml); // Construct the HTML template and convert to PDF
      subscriberEmails.forEach((email) => {
        const articleToHtml = this.createHtmlTemplate(newArticle, email); // Add metadata to the original HTML content
        emailService
          .sendHTMLEmailWithBufferAttachment(
            email,
            `PetHub Newsletter - ${newArticle.title}`,
            articleToHtml,
            `${newArticle.title}-article.pdf`, // fileName
            pdfBuffer,
            "application/pdf"
          )
          .catch((error) => {
            console.error("Error sending email to:", email, "Error:", error);
          });
      });

      return newArticle;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async updateArticle(articlePayload, articleId, internalUserId) {
    try {
      const internalUser = await InternalUserService.getUserById(internalUserId); // validate userid

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
              userId: internalUserId,
            },
          },
          tags: {
            set: [],
            connect: tagIdsArray,
          },
          category: articlePayload.category,
        },
      });
      return updatedArticle;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async deleteArticle(articleId) {
    try {
      await this.deleteFilesOfAnArticle(articleId);
      await prisma.article.delete({
        where: { articleId },
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async createArticleComment(articleId, comment, petOwnerId) {
    try {
      // Check that the article exists
      const article = await this.getArticleById(articleId);

      const articleComment = await prisma.articleComment.create({
        data: {
          comment: comment,
          articleId: article.articleId,
          petOwnerId: petOwnerId,
        },
      });
      return articleComment;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async updateArticleComment(articleCommentId, comment, petOwnerId) {
    try {
      // Check that the article comment exists
      const articleComment = await prisma.articleComment.findUnique({
        where: { articleCommentId },
      });
      if (!articleComment) throw new CustomError("Article comment not found", 404);

      // Check there the article comment belongs to the caller
      if (articleComment.petOwnerId !== petOwnerId) {
        throw new CustomError("You are not the owner of this article comment!", 403);
      }

      const updatedArticleComment = await prisma.articleComment.update({
        where: { articleCommentId: articleCommentId },
        data: {
          comment: comment,
          dateUpdated: new Date(),
        },
      });
      return updatedArticleComment;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async deleteArticleComment(articleCommentId, callee) {
    try {
      // Check that the article comment exists
      const articleComment = await prisma.articleComment.findUnique({
        where: { articleCommentId },
        include: {
          petOwner: {
            select: {
              lastName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          article: {
            select: {
              title: true,
            },
          },
        },
      });
      if (!articleComment) throw new CustomError("Article comment not found", 404);

      // Check there the article comment belongs to the caller, or it is an internal user deleting the comment
      if (callee.accountType !== "INTERNAL_USER" && articleComment.petOwnerId !== callee.userId) {
        throw new CustomError("You are not the owner of this article comment!", 403);
      }

      await prisma.articleComment.delete({
        where: { articleCommentId },
      });

      // If deletion was performed by an admin, send email to pet owner
      if (callee.accountType === "INTERNAL_USER") {
        await emailService.sendEmail(
          articleComment.petOwner.user.email,
          `Article Comment Deleted`,
          emailTemplate.DeleteArticleCommentEmail(articleComment)
        );
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  // Gets a list of articleCommentIds that belong to a specific article for a specific petowner if any
  async getArticleCommentsByArticleIdAndPetOwnerId(articleId, petOwnerId) {
    try {
      // Check that the article exists
      const article = await this.getArticleById(articleId);

      // Validate that petOwner exists
      const petOwner = await petOwnerService.getUserById(petOwnerId);

      const articleComments = await prisma.articleComment.findMany({
        where: {
          articleId: article.articleId,
          petOwnerId: petOwner.userId,
        },
        select: {
          articleCommentId: true,
        },
      });
      return articleComments.map((comment) => comment.articleCommentId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async subscribeToNewsletter(email) {
    try {
      const existingSubscription = await prisma.newsletterSubscription.findUnique({
        where: {
          email: email,
        },
      });

      if (existingSubscription) {
        throw new CustomError("This email is already subscribed to the PetHub Newsletter", 400);
      }

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: email,
        },
      });

      await emailService.sendEmail(
        email,
        `Pethub - Subscribed to Newsletter`,
        emailTemplate.SubscribeToNewsletterEmail(email)
      );

      return subscription;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async unsubscribeFromNewsletter(email) {
    try {
      const existingSubscription = await prisma.newsletterSubscription.findUnique({
        where: {
          email: email,
        },
      });

      if (!existingSubscription) {
        throw new CustomError("This email is not subscribed to the PetHub Newsletter", 400);
      }

      await prisma.newsletterSubscription.delete({
        where: {
          email: email,
        },
      });

      await emailService.sendEmail(
        email,
        `Pethub - Unsubscribed From Newsletter`,
        emailTemplate.UnsubscribeFromNewsletterEmail(email)
      );

      return { message: "Successfully unsubscribed from the PetHub Newsletter" };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ArticleError(error);
    }
  }

  async deleteFilesOfAnArticle(articleId) {
    try {
      const article = await prisma.article.findUnique({
        where: { articleId },
      });

      if (!article) {
        throw new CustomError("article not found", 404);
      }
      await s3ServiceInstance.deleteFiles(article.attachmentKeys);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new ArticleError(error);
    }
  }

  // Convert HTML to PDF
  async htmlToPdf(html) {
    return new Promise((resolve, reject) => {
      pdf.create(html).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }

  // This is for sending the article as HTML to PDF attachment to newsletter subscribers
  createHtmlTemplate(article, subscriberEmail) {
    // Remove line breaks from formatted HTML
    function removeEmptyParagraphs(htmlString) {
      const pattern = /<p><br><\/p>/g;
      return htmlString.replace(pattern, "");
    }

    function formatStringToLetterCase(enumString) {
      return enumString
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const { title, content, articleType, tags, category, attachmentUrls, createdBy, dateCreated } = article;
    const coverImageUrl = attachmentUrls.length > 0 ? attachmentUrls[0] : null;
    const authorName = `${createdBy.firstName} ${createdBy.lastName}`;
    const formattedDateCreated = new Date(dateCreated).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tagsHtml = tags
      ? tags
          .map(
            (tag) =>
              `<span style="margin-right: 5px; background-color: #eef; padding: 3px 6px; border-radius: 4px;">${tag.name}</span>`
          )
          .join("")
      : "";

    const categoryHtml = category
      ? `<span style="color: #06c;">${formatStringToLetterCase(category)}</span>`
      : "";

    const cleanedContent = removeEmptyParagraphs(content);

    return emailTemplate.ArticleHTMLBodyTemplateEmail(
      title,
      cleanedContent,
      authorName,
      formattedDateCreated,
      tagsHtml,
      categoryHtml,
      coverImageUrl,
      formatStringToLetterCase(articleType),
      article.articleId,
      subscriberEmail
    );
  }
}

module.exports = new ArticleService();
