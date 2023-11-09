/*
  Warnings:

  - A unique constraint covering the columns `[stripeRefundId]` on the table `RefundRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PetOwner" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RefundRequest" ADD COLUMN     "stripeRefundId" TEXT;

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "listingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_stripeRefundId_key" ON "RefundRequest"("stripeRefundId");
