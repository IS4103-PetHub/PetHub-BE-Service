/*
  Warnings:

  - You are about to drop the column `category` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "PetBusiness" ADD COLUMN     "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "PetBusinessApplication" ADD COLUMN     "stripeAccountId" TEXT NOT NULL DEFAULT '';
