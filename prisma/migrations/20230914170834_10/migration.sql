-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_petBusinessId_fkey";

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
