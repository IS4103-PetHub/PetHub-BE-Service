-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "payoutInvoiceInvoiceId" INTEGER;

-- CreateTable
CREATE TABLE "PayoutInvoice" (
    "invoiceId" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "commissionCharge" DOUBLE PRECISION NOT NULL,
    "paidOutAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT NOT NULL,
    "attachmentKey" TEXT,
    "attachmentURL" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PayoutInvoice_pkey" PRIMARY KEY ("invoiceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutInvoice_paymentId_key" ON "PayoutInvoice"("paymentId");

-- AddForeignKey
ALTER TABLE "PayoutInvoice" ADD CONSTRAINT "PayoutInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PetBusiness"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_payoutInvoiceInvoiceId_fkey" FOREIGN KEY ("payoutInvoiceInvoiceId") REFERENCES "PayoutInvoice"("invoiceId") ON DELETE SET NULL ON UPDATE CASCADE;
