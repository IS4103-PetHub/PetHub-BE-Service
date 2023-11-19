/*
  Warnings:

  - Made the column `defaultExpiryDays` on table `ServiceListing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceListing" ALTER COLUMN "defaultExpiryDays" SET NOT NULL;
