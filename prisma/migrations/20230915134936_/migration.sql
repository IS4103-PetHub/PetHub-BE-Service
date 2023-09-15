-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PET_OWNER', 'PET_BUSINESS', 'INTERNAL_USER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('MANAGER', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('FNB', 'SERVICE', 'HEALTHCARE');

-- CreateEnum
CREATE TYPE "BusinessApplicationStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PET_GROOMING', 'DINING', 'VETERINARY', 'PET_RETAIL', 'PET_BOARDING');

-- CreateTable
CREATE TABLE "ServiceListing" (
    "serviceListingId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "category" "Category" NOT NULL,
    "petBusinessId" INTEGER NOT NULL,

    CONSTRAINT "ServiceListing_pkey" PRIMARY KEY ("serviceListingId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tagId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tagId")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "groupId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "Permission" (
    "permissionId" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permissionId")
);

-- CreateTable
CREATE TABLE "UserGroupMembership" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "UserGroupMembership_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "UserGroupPermission" (
    "groupId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "UserGroupPermission_pkey" PRIMARY KEY ("groupId","permissionId")
);

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
    "contactNumber" TEXT NOT NULL,
    "businessType" "BusinessType",
    "businessEmail" TEXT,
    "businessDescription" TEXT,
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

-- CreateTable
CREATE TABLE "Address" (
    "addressId" SERIAL NOT NULL,
    "addressName" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "postalCode" TEXT NOT NULL,
    "petBusinessId" INTEGER,
    "petBusinessApplicationId" INTEGER,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "PetBusinessApplication" (
    "petBusinessApplicationId" SERIAL NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "websiteURL" TEXT,
    "attachments" TEXT[],
    "applicationStatus" "BusinessApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminRemarks" TEXT[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "petBusinessId" INTEGER NOT NULL,
    "approverId" INTEGER,

    CONSTRAINT "PetBusinessApplication_pkey" PRIMARY KEY ("petBusinessApplicationId")
);

-- CreateTable
CREATE TABLE "_ServiceListingToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_name_key" ON "UserGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

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

-- CreateIndex
CREATE UNIQUE INDEX "PetBusinessApplication_petBusinessId_key" ON "PetBusinessApplication"("petBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceListingToTag_AB_unique" ON "_ServiceListingToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceListingToTag_B_index" ON "_ServiceListingToTag"("B");

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupMembership" ADD CONSTRAINT "UserGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupMembership" ADD CONSTRAINT "UserGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupPermission" ADD CONSTRAINT "UserGroupPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupPermission" ADD CONSTRAINT "UserGroupPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("permissionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalUser" ADD CONSTRAINT "InternalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetOwner" ADD CONSTRAINT "PetOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessApplicationId_fkey" FOREIGN KEY ("petBusinessApplicationId") REFERENCES "PetBusinessApplication"("petBusinessApplicationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "InternalUser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceListingToTag" ADD CONSTRAINT "_ServiceListingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceListingToTag" ADD CONSTRAINT "_ServiceListingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("tagId") ON DELETE CASCADE ON UPDATE CASCADE;
