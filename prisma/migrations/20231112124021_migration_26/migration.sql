-- AlterTable
ALTER TABLE "PetBusiness" ADD COLUMN     "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "PetBusinessApplication" ADD COLUMN     "stripeAccountId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "bookingId" INTEGER,
ADD COLUMN     "orderItemId" INTEGER,
ADD COLUMN     "payoutInvoiceId" INTEGER,
ADD COLUMN     "refundRequestId" INTEGER,
ADD COLUMN     "serviceListingId" INTEGER;

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
