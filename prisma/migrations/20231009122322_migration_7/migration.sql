-- CreateEnum
CREATE TYPE "PetLostRequestType" AS ENUM ('LOST_PET', 'FOUND_PET');

-- CreateTable
CREATE TABLE "PetLostAndFound" (
    "petLostAndFoundId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestType" "PetLostRequestType" NOT NULL,
    "lastSeenDate" TIMESTAMP(3) NOT NULL,
    "lastSeenLocation" TEXT NOT NULL,
    "attachmentKeys" TEXT[],
    "attachmentURLs" TEXT[],
    "petId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PetLostAndFound_pkey" PRIMARY KEY ("petLostAndFoundId")
);

-- AddForeignKey
ALTER TABLE "PetLostAndFound" ADD CONSTRAINT "PetLostAndFound_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("petId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetLostAndFound" ADD CONSTRAINT "PetLostAndFound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
