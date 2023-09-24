-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('DAILY', 'WEEKLY');

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "calendarGroupId" INTEGER;

-- CreateTable
CREATE TABLE "CalendarGroup" (
    "calendarGroupId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "petBusinessId" INTEGER NOT NULL,

    CONSTRAINT "CalendarGroup_pkey" PRIMARY KEY ("calendarGroupId")
);

-- CreateTable
CREATE TABLE "ScheduleSettings" (
    "scheduleSettingId" SERIAL NOT NULL,
    "days" "DayOfWeek"[],
    "pattern" "RecurrencePattern" NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "calendarGroupId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleSettings_pkey" PRIMARY KEY ("scheduleSettingId")
);

-- CreateTable
CREATE TABLE "TimePeriod" (
    "timePeriodId" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "scheduleSettingId" INTEGER NOT NULL,

    CONSTRAINT "TimePeriod_pkey" PRIMARY KEY ("timePeriodId")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "timeSlotId" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "calendarGroupId" INTEGER NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("timeSlotId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" SERIAL NOT NULL,
    "invoiceId" INTEGER,
    "transactionId" INTEGER,
    "petOwnerId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3),
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "serviceListingId" INTEGER NOT NULL,
    "timeSlotId" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarGroup_petBusinessId_name_key" ON "CalendarGroup"("petBusinessId", "name");

-- AddForeignKey
ALTER TABLE "CalendarGroup" ADD CONSTRAINT "CalendarGroup_petBusinessId_fkey" FOREIGN KEY ("petBusinessId") REFERENCES "PetBusiness"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSettings" ADD CONSTRAINT "ScheduleSettings_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimePeriod" ADD CONSTRAINT "TimePeriod_scheduleSettingId_fkey" FOREIGN KEY ("scheduleSettingId") REFERENCES "ScheduleSettings"("scheduleSettingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("serviceListingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("timeSlotId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_calendarGroupId_fkey" FOREIGN KEY ("calendarGroupId") REFERENCES "CalendarGroup"("calendarGroupId") ON DELETE CASCADE ON UPDATE CASCADE;
