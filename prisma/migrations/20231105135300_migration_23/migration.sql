/*
  Warnings:

  - Added the required column `finalMiscCharge` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalTotalPrice` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointsRedeemed` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "finalMiscCharge" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalTotalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pointsRedeemed" INTEGER NOT NULL;
