-- CreateEnum
CREATE TYPE "FeaturedListingCategoryEnum" AS ENUM ('HOTTEST_LISTINGS', 'ALMOST_GONE', 'MOST_PROMISING_NEW_LISTINGS', 'ALL_TIME_FAVS');

-- CreateTable
CREATE TABLE "FeaturedListingSet" (
    "id" SERIAL NOT NULL,
    "category" "FeaturedListingCategoryEnum" NOT NULL,
    "validityPeriodStart" TIMESTAMP(3),
    "validityPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "FeaturedListingSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeaturedListingSetToServiceListing" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FeaturedListingSetToServiceListing_AB_unique" ON "_FeaturedListingSetToServiceListing"("A", "B");

-- CreateIndex
CREATE INDEX "_FeaturedListingSetToServiceListing_B_index" ON "_FeaturedListingSetToServiceListing"("B");

-- AddForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" ADD CONSTRAINT "_FeaturedListingSetToServiceListing_A_fkey" FOREIGN KEY ("A") REFERENCES "FeaturedListingSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeaturedListingSetToServiceListing" ADD CONSTRAINT "_FeaturedListingSetToServiceListing_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;
