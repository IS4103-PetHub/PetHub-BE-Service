/*
  Warnings:

  - A unique constraint covering the columns `[orderItemId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderItemId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'FULFILLED', 'REFUNDED', 'PAID_OUT', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ServiceListing" DROP CONSTRAINT "ServiceListing_calendarGroupId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "orderItemId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "defaultExpiryDays" INTEGER,
ADD COLUMN     "lastPossibleDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Invoice" (
    "invoiceId" SERIAL NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" INTEGER NOT NULL,
    "miscCharge" DOUBLE PRECISION NOT NULL,
    "petOwnerUserId" INTEGER NOT NULL,
    "serviceListingServiceListingId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoiceId")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "orderItemId" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "voucherCode" TEXT NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "serviceListingId" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "refundRequestId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "processedAt" TIMESTAMP(3),
    "petOwnerId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "petBusinessId" INTEGER NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("refundRequestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON "Invoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_orderItemId_key" ON "RefundRequest"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_orderItemId_key" ON "Booking"("orderItemId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_petOwnerUserId_fkey" FOREIGN KEY ("petOwnerUserId") REFERENCES "PetOwner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_serviceListingServiceListingId_fkey" FOREIGN KEY ("serviceListingServiceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("invoiceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
