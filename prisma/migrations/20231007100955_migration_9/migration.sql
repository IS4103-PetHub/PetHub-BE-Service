/*
  Warnings:

  - Added the required column `commissionRuleId` to the `PetBusiness` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PetBusinessApplication" DROP CONSTRAINT "PetBusinessApplication_petBusinessId_fkey";

-- AlterTable
ALTER TABLE "PetBusiness" ADD COLUMN     "commissionRuleId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CommissionRule" (
    "commissionRuleId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("commissionRuleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommissionRule_name_key" ON "CommissionRule"("name");

-- AddForeignKey
ALTER TABLE "PetBusiness" ADD CONSTRAINT "PetBusiness_commissionRuleId_fkey" FOREIGN KEY ("commissionRuleId") REFERENCES "CommissionRule"("commissionRuleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBusinessApplication" ADD CONSTRAINT "PetBusinessApplication_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
