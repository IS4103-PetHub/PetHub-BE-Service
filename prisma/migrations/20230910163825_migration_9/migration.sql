-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PET_GROOMING', 'DINING', 'VETERINARY', 'PET_RETAIL', 'PET_BOARDING');

-- CreateTable
CREATE TABLE "ServiceListing" (
    "serviceListingId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL DEFAULT 0,
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
CREATE TABLE "_ServiceListingToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceListingToTag_AB_unique" ON "_ServiceListingToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceListingToTag_B_index" ON "_ServiceListingToTag"("B");

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceListingToTag" ADD CONSTRAINT "_ServiceListingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceListingToTag" ADD CONSTRAINT "_ServiceListingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("tagId") ON DELETE CASCADE ON UPDATE CASCADE;
