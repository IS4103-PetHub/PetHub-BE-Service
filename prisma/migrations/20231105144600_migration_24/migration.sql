-- CreateTable
CREATE TABLE "Bump" (
    "bumpId" SERIAL NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountCharged" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "serviceListingId" INTEGER NOT NULL,

    CONSTRAINT "Bump_pkey" PRIMARY KEY ("bumpId")
);

-- AddForeignKey
ALTER TABLE "Bump" ADD CONSTRAINT "Bump_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;
