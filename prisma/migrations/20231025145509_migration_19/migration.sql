/*
  Warnings:

  - You are about to drop the column `isHidden` on the `Review` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewReportReason" AS ENUM ('RUDE_ABUSIVE', 'PORNOGRAPHIC', 'SPAM', 'EXPOSING_PERSONAL_INFORMATION', 'UNAUTHORIZED_ADVERTISEMENT', 'INACCURATE_MISLEADING', 'OTHERS');

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "isHidden";

-- CreateTable
CREATE TABLE "ReportReview" (
    "reportReviewId" SERIAL NOT NULL,
    "petOwnerId" INTEGER NOT NULL,
    "reportReason" "ReviewReportReason" NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "ReportReview_pkey" PRIMARY KEY ("reportReviewId")
);

-- CreateTable
CREATE TABLE "_PetOwnerToReview" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PetOwnerToReview_AB_unique" ON "_PetOwnerToReview"("A", "B");

-- CreateIndex
CREATE INDEX "_PetOwnerToReview_B_index" ON "_PetOwnerToReview"("B");

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("reviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetOwnerToReview" ADD CONSTRAINT "_PetOwnerToReview_A_fkey" FOREIGN KEY ("A") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetOwnerToReview" ADD CONSTRAINT "_PetOwnerToReview_B_fkey" FOREIGN KEY ("B") REFERENCES "Review"("reviewId") ON DELETE CASCADE ON UPDATE CASCADE;
