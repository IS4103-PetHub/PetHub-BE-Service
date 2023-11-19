/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Bump` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `Bump` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bump" ADD COLUMN     "paymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bump_paymentId_key" ON "Bump"("paymentId");
