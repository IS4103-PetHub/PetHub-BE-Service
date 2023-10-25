/*
  Warnings:

  - Added the required column `contactNumber` to the `PetLostAndFound` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeaturedListingCategoryEnum" AS ENUM ('HOTTEST_LISTINGS', 'ALMOST_GONE', 'MOST_PROMISING_NEW_LISTINGS', 'ALL_TIME_FAVS');

-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateFulfilled" TIMESTAMP(3),
ADD COLUMN     "payoutInvoiceInvoiceId" INTEGER;

-- AlterTable
ALTER TABLE "PetLostAndFound" ADD COLUMN     "contactNumber" TEXT NOT NULL;

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
CREATE TABLE "EmailVerification" (
    "token" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FeaturedListingSetToServiceListing" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutInvoice_paymentId_key" ON "PayoutInvoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_email_key" ON "EmailVerification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_FeaturedListingSetToServiceListing_AB_unique" ON "_FeaturedListingSetToServiceListing"("A", "B");

-- CreateIndex
CREATE INDEX "_FeaturedListingSetToServiceListing_B_index" ON "_FeaturedListingSetToServiceListing"("B");

-- AddForeignKey
ALTER TABLE "PayoutInvoice" ADD CONSTRAINT "PayoutInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_payoutInvoiceInvoiceId_fkey" FOREIGN KEY ("payoutInvoiceInvoiceId") REFERENCES "PayoutInvoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" ADD CONSTRAINT "_FeaturedListingSetToServiceListing_A_fkey" FOREIGN KEY ("A") REFERENCES "FeaturedListingSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" ADD CONSTRAINT "_FeaturedListingSetToServiceListing_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;
