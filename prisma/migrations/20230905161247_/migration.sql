-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PET_OWNER', 'PET_BUSINESS', 'INTERNAL_USER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('MANAGER', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('FNB', 'SERVICE', 'HEALTHCARE');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "InternalUser" (
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "adminRole" "AdminRole" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "InternalUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PetOwner" (
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PetOwner_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PetBusiness" (
    "companyName" TEXT NOT NULL,
    "uen" TEXT NOT NULL,
    "businessType" "BusinessType",
    "businessDescription" TEXT,
    "contactNumber" TEXT NOT NULL,
    "websiteURL" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PetBusiness_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ResetPassword" (
    "token" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InternalUser_userId_key" ON "InternalUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PetOwner_userId_key" ON "PetOwner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PetBusiness_userId_key" ON "PetBusiness"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_token_key" ON "ResetPassword"("token");

-- AddForeignKey
ALTER TABLE "InternalUser" ADD CONSTRAINT "InternalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetOwner" ADD CONSTRAINT "PetOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
