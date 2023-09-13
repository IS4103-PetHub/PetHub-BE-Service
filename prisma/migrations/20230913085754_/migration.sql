/*
  Warnings:

  - You are about to drop the column `petBusinessApplicationPetBusinessApplicationId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `petBusinessUserId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `internalUserUserId` on the `PetBusinessApplication` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[petBusinessId]` on the table `PetBusinessApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_petBusinessApplicationPetBusinessApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_petBusinessUserId_fkey";

-- DropForeignKey
ALTER TABLE "PetBusinessApplication" DROP CONSTRAINT "PetBusinessApplication_internalUserUserId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "petBusinessApplicationPetBusinessApplicationId",
DROP COLUMN "petBusinessUserId",
ADD COLUMN     "petBusinessApplicationId" INTEGER,
ADD COLUMN     "petBusinessId" INTEGER;

-- AlterTable
ALTER TABLE "PetBusinessApplication" DROP COLUMN "internalUserUserId",
ADD COLUMN     "approverId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PetBusinessApplication_petBusinessId_key" ON "PetBusinessApplication"("petBusinessId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessApplicationId_fkey" FOREIGN KEY ("petBusinessApplicationId") REFERENCES "PetBusinessApplication"("petBusinessApplicationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "InternalUser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
