-- CreateEnum
CREATE TYPE "BusinessApplicationStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED');

-- CreateTable
CREATE TABLE "Address" (
    "addressId" SERIAL NOT NULL,
    "addressName" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "postalCode" TEXT NOT NULL,
    "petBusinessUserId" INTEGER,
    "petBusinessApplicationPetBusinessApplicationId" INTEGER,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "PetBusinessApplication" (
    "petBusinessApplicationId" SERIAL NOT NULL,
    "businessType" "BusinessType",
    "businessEmail" TEXT NOT NULL,
    "attachments" TEXT[],
    "applicationStatus" "BusinessApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminRemarks" TEXT[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "petBusinessId" INTEGER NOT NULL,
    "internalUserUserId" INTEGER,

    CONSTRAINT "PetBusinessApplication_pkey" PRIMARY KEY ("petBusinessApplicationId")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessUserId_fkey" FOREIGN KEY ("petBusinessUserId") REFERENCES "PetBusiness"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessApplicationPetBusinessApplicationId_fkey" FOREIGN KEY ("petBusinessApplicationPetBusinessApplicationId") REFERENCES "PetBusinessApplication"("petBusinessApplicationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_internalUserUserId_fkey" FOREIGN KEY ("internalUserUserId") REFERENCES "InternalUser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
