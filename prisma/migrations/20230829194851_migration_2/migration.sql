/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PET_OWNER', 'PET_BUSINESS', 'INTERNAL_USER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('MANAGER', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('FNB', 'SERVICE', 'HEALTHCARE');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "InternalUser" (
    "internalUserID" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "adminRole" "AdminRole" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "InternalUser_pkey" PRIMARY KEY ("internalUserID")
);

-- CreateTable
CREATE TABLE "PetOwner" (
    "petOwnerId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PetOwner_pkey" PRIMARY KEY ("petOwnerId")
);

-- CreateTable
CREATE TABLE "PetBusiness" (
    "petBusinessId" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "uen" TEXT NOT NULL,
    "businessType" "BusinessType",
    "businessDescription" TEXT,
    "contactNumber" TEXT NOT NULL,
    "websiteURL" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PetBusiness_pkey" PRIMARY KEY ("petBusinessId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InternalUser_userId_key" ON "InternalUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PetOwner_userId_key" ON "PetOwner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PetBusiness_userId_key" ON "PetBusiness"("userId");

-- AddForeignKey
ALTER TABLE "InternalUser" ADD CONSTRAINT "InternalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetOwner" ADD CONSTRAINT "PetOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
