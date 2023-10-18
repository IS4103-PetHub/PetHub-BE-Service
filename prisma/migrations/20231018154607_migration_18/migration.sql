/*
  Warnings:

  - Added the required column `contactNumber` to the `PetLostAndFound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateFulfilled" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PetLostAndFound" ADD COLUMN     "contactNumber" TEXT NOT NULL;
