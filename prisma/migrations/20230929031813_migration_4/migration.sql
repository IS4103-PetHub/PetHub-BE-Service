-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('DOG', 'CAT', 'BIRD', 'TERRAPIN', 'RABBIT', 'RODENT', 'OTHERS');

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "duration" INTEGER;

-- CreateTable
CREATE TABLE "Pet" (
    "petId" SERIAL NOT NULL,
    "petName" TEXT NOT NULL,
    "petType" "PetType" NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "petWeight" DOUBLE PRECISION,
    "microchipNumber" TEXT,
    "attachmentKeys" TEXT[],
    "attachmentURLs" TEXT[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "petOwnerId" INTEGER NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("petId")
);

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
