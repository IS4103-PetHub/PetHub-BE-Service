/*
  Warnings:

  - You are about to drop the column `attatchments` on the `ServiceListing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceListing" DROP COLUMN "attatchments",
ADD COLUMN     "attachment" TEXT[];
