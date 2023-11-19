/*
  Warnings:

  - You are about to drop the column `attachments` on the `Comment` table. All the data in the column will be lost.
  - Made the column `userId` on table `Comment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "attachments",
ADD COLUMN     "attachmentKeys" TEXT[],
ADD COLUMN     "attachmentURLs" TEXT[],
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
