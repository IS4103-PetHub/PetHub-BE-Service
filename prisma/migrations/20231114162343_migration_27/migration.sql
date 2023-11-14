-- AlterEnum
ALTER TYPE "SupportCategoryEnum" ADD VALUE 'REFUNDS';

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "invoiceId" INTEGER;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;
