/*
  Warnings:

  - Added the required column `attachmentKey` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attachmentURL` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "attachmentKey" TEXT NOT NULL,
ADD COLUMN     "attachmentURL" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateFulfilled" TIMESTAMP(3);
