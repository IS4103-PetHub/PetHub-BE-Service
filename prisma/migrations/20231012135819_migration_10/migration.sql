/*
  Warnings:

  - You are about to drop the column `orderItemId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "PetBusiness" DROP CONSTRAINT "PetBusiness_commissionRuleId_fkey";

-- DropIndex
DROP INDEX "Booking_orderItemId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "orderItemId";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "bookingBookingId" INTEGER;

-- AlterTable
ALTER TABLE "PetBusiness" ALTER COLUMN "commissionRuleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookingBookingId_fkey" FOREIGN KEY ("bookingBookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_commissionRuleId_fkey" FOREIGN KEY ("commissionRuleId") REFERENCES "CommissionRule"("commissionRuleId") ON DELETE SET NULL ON UPDATE CASCADE;
