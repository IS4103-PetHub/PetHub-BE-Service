-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'PENDING_VERIFICATION';

-- CreateTable
CREATE TABLE "EmailVerification" (
    "token" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_email_key" ON "EmailVerification"("email");
