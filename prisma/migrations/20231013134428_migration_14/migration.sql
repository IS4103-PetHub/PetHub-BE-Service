/*
  Warnings:

  - You are about to drop the column `bookingId` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderItemId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderItemId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `expiryDate` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_bookingId_fkey";

-- DropIndex
DROP INDEX "OrderItem_bookingId_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "orderItemId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "bookingId",
ALTER COLUMN "expiryDate" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_orderItemId_key" ON "Booking"("orderItemId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;
