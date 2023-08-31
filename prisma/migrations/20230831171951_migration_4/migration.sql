/*
  Warnings:

  - The primary key for the `InternalUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `internalUserID` on the `InternalUser` table. All the data in the column will be lost.
  - The primary key for the `PetBusiness` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `petBusinessId` on the `PetBusiness` table. All the data in the column will be lost.
  - The primary key for the `PetOwner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `petOwnerId` on the `PetOwner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InternalUser" DROP CONSTRAINT "InternalUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "PetBusiness" DROP CONSTRAINT "PetBusiness_userId_fkey";

-- DropForeignKey
ALTER TABLE "PetOwner" DROP CONSTRAINT "PetOwner_userId_fkey";

-- AlterTable
ALTER TABLE "InternalUser" DROP CONSTRAINT "InternalUser_pkey",
DROP COLUMN "internalUserID",
ADD CONSTRAINT "InternalUser_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "PetBusiness" DROP CONSTRAINT "PetBusiness_pkey",
DROP COLUMN "petBusinessId",
ADD CONSTRAINT "PetBusiness_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "PetOwner" DROP CONSTRAINT "PetOwner_pkey",
DROP COLUMN "petOwnerId",
ADD CONSTRAINT "PetOwner_pkey" PRIMARY KEY ("userId");

-- AddForeignKey
ALTER TABLE "InternalUser" ADD CONSTRAINT "InternalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetOwner" ADD CONSTRAINT "PetOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
