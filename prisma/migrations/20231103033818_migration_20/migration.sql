-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'CLOSED_RESOLVED', 'CLOSED_UNRESOLVED');

-- CreateEnum
CREATE TYPE "SupportCategoryEnum" AS ENUM ('GENERAL_ENQUIRY', 'SERVICE_LISTINGS', 'ORDERS', 'APPOINTMENTS', 'PAYMENTS', 'ACCOUNTS', 'OTHERS');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "supportTicketId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3),
    "attachmentKeys" TEXT[],
    "attachmentURLs" TEXT[],
    "supportCategory" "SupportCategoryEnum" NOT NULL,
    "priority" "Priority" NOT NULL,
    "petOwnerId" INTEGER,
    "petBusinessId" INTEGER,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("supportTicketId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,
    "attachments" TEXT[],
    "supportTicketId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "PetOwner"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("supportTicketId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
