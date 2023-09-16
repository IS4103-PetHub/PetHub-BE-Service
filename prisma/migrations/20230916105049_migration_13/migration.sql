/*
  Warnings:

  - You are about to drop the column `attachment` on the `ServiceListing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceListing" DROP COLUMN "attachment",
ADD COLUMN     "attachmentKeys" TEXT[],
ADD COLUMN     "attachmentURLs" TEXT[];
