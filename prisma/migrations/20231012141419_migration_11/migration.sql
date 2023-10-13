/*
  Warnings:

  - The values [PENDING] on the enum `OrderItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderItemStatus_new" AS ENUM ('PENDING_BOOKING', 'PENDING_FULFILLMENT', 'FULFILLED', 'PAID_OUT', 'REFUNDED', 'EXPIRED');
ALTER TYPE "OrderItemStatus" RENAME TO "OrderItemStatus_old";
ALTER TYPE "OrderItemStatus_new" RENAME TO "OrderItemStatus";
DROP TYPE "OrderItemStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "requiresBooking" BOOLEAN NOT NULL DEFAULT false;
