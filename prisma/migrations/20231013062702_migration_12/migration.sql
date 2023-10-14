/*
  Warnings:

  - You are about to drop the column `commissionRate` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `serviceListingServiceListingId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `commissionRate` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `defaultExpiryDays` on table `ServiceListing` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_serviceListingServiceListingId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "commissionRate",
DROP COLUMN "serviceListingServiceListingId",
ALTER COLUMN "paymentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "quantity",
ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING_FULFILLMENT';

-- AlterTable
ALTER TABLE "ServiceListing" ALTER COLUMN "defaultExpiryDays" SET NOT NULL;
