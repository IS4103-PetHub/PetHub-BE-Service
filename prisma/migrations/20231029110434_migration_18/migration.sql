/*
  Warnings:

  - Added the required column `contactNumber` to the `PetLostAndFound` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeaturedListingCategoryEnum" AS ENUM ('HOTTEST_LISTINGS', 'ALMOST_GONE', 'RISING_LISTINGS', 'ALL_TIME_FAVS');

-- CreateEnum
CREATE TYPE "ReviewReportReason" AS ENUM ('RUDE_ABUSIVE', 'PORNOGRAPHIC', 'SPAM', 'EXPOSING_PERSONAL_INFORMATION', 'UNAUTHORIZED_ADVERTISEMENT', 'INACCURATE_MISLEADING', 'OTHERS');

-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateFulfilled" TIMESTAMP(3),
ADD COLUMN     "payoutInvoiceInvoiceId" INTEGER;

-- AlterTable
ALTER TABLE "PetLostAndFound" ADD COLUMN     "contactNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "overallRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PayoutInvoice" (
    "invoiceId" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "commissionCharge" DOUBLE PRECISION NOT NULL,
    "paidOutAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT NOT NULL,
    "attachmentKey" TEXT,
    "attachmentURL" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PayoutInvoice_pkey" PRIMARY KEY ("invoiceId")
);

-- CreateTable
CREATE TABLE "FeaturedListingSet" (
    "id" SERIAL NOT NULL,
    "category" "FeaturedListingCategoryEnum" NOT NULL,
    "validityPeriodStart" TIMESTAMP(3),
    "validityPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "FeaturedListingSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedListing" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "serviceListingId" INTEGER NOT NULL,
    "featuredListingSetId" INTEGER NOT NULL,

    CONSTRAINT "FeaturedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "reply" TEXT,
    "replyDate" TIMESTAMP(3),
    "rating" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "attachmentKeys" TEXT[],
    "attachmentURLs" TEXT[],
    "orderItemId" INTEGER NOT NULL,
    "serviceListingId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewId")
);

-- CreateTable
CREATE TABLE "ReportReview" (
    "reportReviewId" SERIAL NOT NULL,
    "petOwnerId" INTEGER NOT NULL,
    "reportReason" "ReviewReportReason" NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "ReportReview_pkey" PRIMARY KEY ("reportReviewId")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "token" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PetOwnerToReview" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutInvoice_paymentId_key" ON "PayoutInvoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_email_key" ON "EmailVerification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_PetOwnerToReview_AB_unique" ON "_PetOwnerToReview"("A", "B");

-- CreateIndex
CREATE INDEX "_PetOwnerToReview_B_index" ON "_PetOwnerToReview"("B");

-- AddForeignKey
ALTER TABLE "PayoutInvoice" ADD CONSTRAINT "PayoutInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_payoutInvoiceInvoiceId_fkey" FOREIGN KEY ("payoutInvoiceInvoiceId") REFERENCES "PayoutInvoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedListing" ADD CONSTRAINT "FeaturedListing_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedListing" ADD CONSTRAINT "FeaturedListing_featuredListingSetId_fkey" FOREIGN KEY ("featuredListingSetId") REFERENCES "FeaturedListingSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("reviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetOwnerToReview" ADD CONSTRAINT "_PetOwnerToReview_A_fkey" FOREIGN KEY ("A") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetOwnerToReview" ADD CONSTRAINT "_PetOwnerToReview_B_fkey" FOREIGN KEY ("B") REFERENCES "Review"("reviewId") ON DELETE CASCADE ON UPDATE CASCADE;
