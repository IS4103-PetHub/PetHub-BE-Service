/*
  Warnings:

  - Made the column `businessType` on table `PetBusinessApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PetBusinessApplication" ALTER COLUMN "businessType" SET NOT NULL;
