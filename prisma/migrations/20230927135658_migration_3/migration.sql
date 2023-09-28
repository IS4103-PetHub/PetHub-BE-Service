/*
  Warnings:

  - You are about to drop the column `vacancies` on the `ScheduleSettings` table. All the data in the column will be lost.
  - Added the required column `vacancies` to the `TimePeriod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleSettings" DROP COLUMN "vacancies";

-- AlterTable
ALTER TABLE "TimePeriod" ADD COLUMN     "vacancies" INTEGER NOT NULL;
