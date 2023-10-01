-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "petId" INTEGER;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("petId") ON DELETE CASCADE ON UPDATE CASCADE;
