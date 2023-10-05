-- DropForeignKey
ALTER TABLE "ServiceListing" DROP CONSTRAINT "ServiceListing_calendarGroupId_fkey";

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE SET NULL ON UPDATE CASCADE;
