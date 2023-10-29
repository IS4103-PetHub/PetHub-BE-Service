/*
  Warnings:

  - Made the column `reason` on table `RefundRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefundRequest" ADD COLUMN     "comment" TEXT,
ALTER COLUMN "reason" SET NOT NULL;
