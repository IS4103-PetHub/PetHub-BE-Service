-- AlterEnum
ALTER TYPE "SupportCategoryEnum" ADD VALUE 'REFUNDS';

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "category" "Category",
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PetBusiness" ADD COLUMN     "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "PetBusinessApplication" ADD COLUMN     "stripeAccountId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "bookingId" INTEGER,
ADD COLUMN     "invoiceId" INTEGER,
ADD COLUMN     "orderItemId" INTEGER,
ADD COLUMN     "payoutInvoiceId" INTEGER,
ADD COLUMN     "refundRequestId" INTEGER,
ADD COLUMN     "serviceListingId" INTEGER;

-- CreateTable
CREATE TABLE "ArticleComment" (
    "articleCommentId" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3),
    "articleId" INTEGER NOT NULL,
    "petOwnerId" INTEGER NOT NULL,

    CONSTRAINT "ArticleComment_pkey" PRIMARY KEY ("articleCommentId")
);

-- CreateTable
CREATE TABLE "_ArticleToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToTag_AB_unique" ON "_ArticleToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToTag_B_index" ON "_ArticleToTag"("B");

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("articleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_payoutInvoiceId_fkey" FOREIGN KEY ("payoutInvoiceId") REFERENCES "PayoutInvoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "RefundRequest"("refundRequestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("articleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("tagId") ON DELETE CASCADE ON UPDATE CASCADE;
