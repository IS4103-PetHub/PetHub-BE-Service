/*
  Warnings:

  - You are about to drop the column `endpoint` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "endpoint",
DROP COLUMN "method";
