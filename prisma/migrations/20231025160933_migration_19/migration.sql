/*
  Warnings:

  - The values [MOST_PROMISING_NEW_LISTINGS] on the enum `FeaturedListingCategoryEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeaturedListingCategoryEnum_new" AS ENUM ('HOTTEST_LISTINGS', 'ALMOST_GONE', 'RISING_LISTINGS', 'ALL_TIME_FAVS');
ALTER TABLE "FeaturedListingSet" ALTER COLUMN "category" TYPE "FeaturedListingCategoryEnum_new" USING ("category"::text::"FeaturedListingCategoryEnum_new");
ALTER TYPE "FeaturedListingCategoryEnum" RENAME TO "FeaturedListingCategoryEnum_old";
ALTER TYPE "FeaturedListingCategoryEnum_new" RENAME TO "FeaturedListingCategoryEnum";
DROP TYPE "FeaturedListingCategoryEnum_old";
COMMIT;
