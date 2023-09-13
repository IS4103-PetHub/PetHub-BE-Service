/*
  Warnings:

  - Added the required column `websiteURL` to the `PetBusinessApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PetBusinessApplication" ADD COLUMN     "websiteURL" TEXT NOT NULL;
