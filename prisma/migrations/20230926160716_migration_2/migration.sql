-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_calendarGroupId_fkey";

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE CASCADE ON UPDATE CASCADE;
