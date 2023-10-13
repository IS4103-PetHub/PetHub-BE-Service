/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingBookingId` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_bookingBookingId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "invoiceId",
DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "bookingBookingId",
ADD COLUMN     "bookingId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_bookingId_key" ON "OrderItem"("bookingId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;
