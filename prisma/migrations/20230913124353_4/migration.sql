/*
  Warnings:

  - Added the required column `businessDescription` to the `PetBusinessApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PetBusinessApplication" ADD COLUMN     "businessDescription" TEXT NOT NULL;
