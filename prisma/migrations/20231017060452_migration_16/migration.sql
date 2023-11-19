-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('ANNOUNCEMENTS', 'TIPS_AND_TRICKS', 'EVENTS', 'OTHERS');

-- CreateTable
CREATE TABLE "Article" (
    "articleId" SERIAL NOT NULL,
    "articleType" "ArticleType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "updatedByUserId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3),
    "attachmentKeys" TEXT[],
    "attachmentUrls" TEXT[],

    CONSTRAINT "Article_pkey" PRIMARY KEY ("articleId")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "InternalUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "InternalUser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
