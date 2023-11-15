-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ArticleComment" (
    "articleCommentId" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3),
    "articleId" INTEGER NOT NULL,
    "petOwnerId" INTEGER NOT NULL,

    CONSTRAINT "ArticleComment_pkey" PRIMARY KEY ("articleCommentId")
);

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("articleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
