/*
  Warnings:

  - You are about to drop the `_FeaturedListingSetToServiceListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" DROP CONSTRAINT "_FeaturedListingSetToServiceListing_A_fkey";

-- DropForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" DROP CONSTRAINT "_FeaturedListingSetToServiceListing_B_fkey";

-- DropTable
DROP TABLE "_FeaturedListingSetToServiceListing";

-- CreateTable
CREATE TABLE "FeaturedListing" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "serviceListingId" INTEGER NOT NULL,
    "featuredListingSetId" INTEGER NOT NULL,

    CONSTRAINT "FeaturedListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FeaturedListing" ADD CONSTRAINT "FeaturedListing_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedListing" ADD CONSTRAINT "FeaturedListing_featuredListingSetId_fkey" FOREIGN KEY ("featuredListingSetId") REFERENCES "FeaturedListingSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
