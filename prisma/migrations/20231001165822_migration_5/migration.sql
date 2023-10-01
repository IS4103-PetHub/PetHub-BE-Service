-- CreateTable
CREATE TABLE "_PetOwnerToServiceListing" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PetOwnerToServiceListing_AB_unique" ON "_PetOwnerToServiceListing"("A", "B");

-- CreateIndex
CREATE INDEX "_PetOwnerToServiceListing_B_index" ON "_PetOwnerToServiceListing"("B");

-- AddForeignKey
ALTER TABLE "_PetOwnerToServiceListing" ADD CONSTRAINT "_PetOwnerToServiceListing_A_fkey" FOREIGN KEY ("A") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetOwnerToServiceListing" ADD CONSTRAINT "_PetOwnerToServiceListing_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;
