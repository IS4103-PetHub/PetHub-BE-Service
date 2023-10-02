const prisma = require('../../../../prisma/prisma');
const CalendarGroupError = require('../../errors/calendarGroupError');
const CustomError = require('../../errors/customError');
const { RecurrencePattern } = require('@prisma/client');
const EmailService = require('../emailService')
const PetOwnerService = require('../user/petOwnerService')
const { differenceInDays, addDays, format, parseISO } = require('date-fns');
const emailTemplate = require('../../resource/emailTemplate');
const { getAllCalendarGroups } = require('../../controllers/calendarGroupController');
const PetBusinessService = require('../user/petBusinessService');
const emailService = require('../emailService');

class CalendarGroupService {

    async getAvailability(calendarGroupId, startTime, endTime, bookingDuration) {
        // 1. Fetch all the timeslots

        const queryStartDate = new Date(startTime);
        queryStartDate.setHours(0, 0, 0, 0);

        const queryEndDate = new Date(endTime);
        queryEndDate.setHours(23, 59, 59, 999);

        const timeSlots = await prisma.timeSlot.findMany({
            where: {
                calendarGroupId: calendarGroupId,
                startTime: { gte: queryStartDate },  // from startTime
                endTime: { lte: queryEndDate }       // to endTime
            },
            include: { Booking: true }
        });

        let availableSlots = [];

        // 2. For each timeslot, get the available sub-slots
        for (let slot of timeSlots) {
            const slotsForThisTimeSlot = this.getAvailabilityForTimeSlot(slot, bookingDuration, startTime, endTime);
            availableSlots = [...availableSlots, ...slotsForThisTimeSlot];
        }

        return availableSlots;
    }

    getAvailabilityForTimeSlot(timeSlot, bookingDuration, searchStartTime, searchEndTime) {
        let availableSlots = [];
        let slotStart = new Date(Math.max(timeSlot.startTime, searchStartTime));
        const slotEnd = new Date(Math.min(timeSlot.endTime, searchEndTime));

        // Iterate within the timeslot
        while (slotStart <= slotEnd - bookingDuration * 60000) {
            let proposedEnd = new Date(slotStart.getTime() + bookingDuration * 60000);

            // Count overlapping bookings
            const overlappingBookings = timeSlot.Booking.filter(booking => slotStart < new Date(booking.endTime) && proposedEnd > new Date(booking.startTime)).length;
            const availableVacancies = timeSlot.vacancies - overlappingBookings;

            if (availableVacancies > 0) {
                availableSlots.push({
                    calendarGroupId: timeSlot.calendarGroupId,
                    timeSlotId: timeSlot.timeSlotId,
                    startTime: slotStart.toISOString(),
                    endTime: proposedEnd.toISOString(),
                    vacancies: availableVacancies
                });
            }
            slotStart = proposedEnd;
        }
        return availableSlots;
    }

    async getAllCalendarGroups(includeTimeSlot = false, includeBooking = false) {
        try {
            const calendarGroups = await prisma.calendarGroup.findMany({
                include: {
                    timeslots: includeTimeSlot ? {
                        include: { Booking: includeBooking }
                    } : false,
                    scheduleSettings: true
                }
            });

            return calendarGroups;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CalendarGroupError(error);
        }
    }

    async getAllPetBusinessCalendarGroup(petBusinessId) {
        try {
            const calendarGroups = await prisma.calendarGroup.findMany({
                where: { petBusinessId: petBusinessId },
            });
            return calendarGroups;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CalendarGroupError(error);
        }
    }

    async getCalendarGroupById(calendarGroupId, includeTimeSlot = false, includeBooking = false, formatForFrontend = false) {
        try {
            let includeField = {
                timeslots: includeTimeSlot ? {
                    include: { Booking: includeBooking ? {
                        include: { serviceListing: true }
                    } : false }
                } : false,
                scheduleSettings: true
            };
    
            if (formatForFrontend) {
                // FE requires timePeriods to be included in scheduleSettings instead
                includeField = {
                    scheduleSettings: {
                        include: { 
                            timePeriods: true 
                        },
                    },
                };
            }

            const calendarGroup = await prisma.calendarGroup.findUnique({
                where: { calendarGroupId: calendarGroupId },
                include: includeField
            });

            if (!calendarGroup) throw new CustomError(`CalendarGroup with id (${calendarGroupId}) not found`, 404);

            if (formatForFrontend) {
              // FE requires scheduleSettings to be nested inside a layer of 'recurrence'
              const transformedCalendarGroup = {
                calendarGroupId: calendarGroup.calendarGroupId,
                name: calendarGroup.name,
                description: calendarGroup.description,
                scheduleSettings: calendarGroup.scheduleSettings.map((setting) => ({
                  scheduleSettingsId: setting.scheduleSettingId,
                  days: setting.days,
                  recurrence: {
                    pattern: setting.pattern,
                    startDate: setting.startDate,
                    endDate: setting.endDate,
                    timePeriods: setting.timePeriods.map((period) => ({
                      timePeriodId: period.timePeriodId,
                      startTime: period.startTime,
                      endTime: period.endTime,
                      vacancies: period.vacancies,
                    })),
                  },
                })),
              };
              return transformedCalendarGroup;
            }

            return calendarGroup;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CalendarGroupError(error);
        }
    }


    async createCalendarGroup(calendarGroupData, petBusinessId) {
        try {
            const petBusiness = await PetBusinessService.getUserById(petBusinessId) // Validate if it's pet business

            const scheduleSettingsData = await this.mapToScheduleSettings(calendarGroupData.scheduleSettings);
            const timeSlotsData = await this.mapToTimeSlots(calendarGroupData.scheduleSettings)
            console.log(timeSlotsData)
            const newCalendarGroup = await prisma.calendarGroup.create({
                data: {
                    name: calendarGroupData.name,
                    description: calendarGroupData.description,
                    petBusinessId: petBusinessId,
                    scheduleSettings: {
                        create: scheduleSettingsData
                    },
                    timeslots: {
                        create: timeSlotsData
                    }
                },
                include: {
                    scheduleSettings: true  // Include related scheduleSettings in the response
                }
            });

            return newCalendarGroup;
        } catch (error) {
            if (error instanceof CustomError) throw error
            throw new CalendarGroupError(error);
        }
    }

    async deleteCalendarGroup(calendarGroupId) {
        try {
            // Fetch the calendar group with all related bookings.
            const calendarGroup = await this.getCalendarGroupById(calendarGroupId, true, true, false);
            const Bookings = calendarGroup.timeslots.flatMap(timeslot => timeslot.Booking);

            // Deleting the entire calendar group.
            await prisma.calendarGroup.delete({
                where: { calendarGroupId: calendarGroupId },
            });

            // Emailing all affected bookings.
            for (const booking of Bookings) {
                const petOwner = await PetOwnerService.getUserById(Number(booking.petOwnerId));
                const emailTitle = "[Notification] Your Booking Has Been Cancelled ";

                await emailService.sendEmail(
                    petOwner.user.email,
                    emailTitle,
                    emailTemplate.rescheduleOrRefundBookingEmail(
                        petOwner.firstName,
                        "localhost:3002/customer/appointments",
                        booking
                    )
                )
            }

            return true; // Returning true to indicate successful deletion.
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CalendarGroupError(error);
        }
    }



    async updateCalendarGroup(calendarGroupId, calendarGroupData) {
        try {
            const calendarGroup = await this.getCalendarGroupById(calendarGroupId, true, true, false)
            let updatedCalendarGroup;
            if (calendarGroupData.name || calendarGroupData.description) {
                updatedCalendarGroup = await prisma.calendarGroup.update({
                    where: { calendarGroupId: calendarGroupId },
                    data: {
                        name: calendarGroupData.name,
                        description: calendarGroupData.description,
                    }
                });
            }

            if (calendarGroupData.scheduleSettings) {
                // Get all existing bookings to be migrated or processed later
                const Bookings = calendarGroup.timeslots.flatMap(timeslot => timeslot.Booking);

                // Create new scheduledSettings (including TimePeriods), and timeSlots
                const scheduleSettingsData = await this.mapToScheduleSettings(calendarGroupData.scheduleSettings);
                const timeSlotsData = await this.mapToTimeSlots(calendarGroupData.scheduleSettings)

                updatedCalendarGroup = await prisma.calendarGroup.update({
                    where: { calendarGroupId: calendarGroupId }, // Specify the calendar group to update
                    data: {
                        scheduleSettings: {
                            // Delete existing and create new scheduleSettings
                            deleteMany: {},
                            create: scheduleSettingsData,
                        },
                        timeslots: {
                            // Delete existing and create new timeslots
                            deleteMany: {},
                            create: timeSlotsData,
                        },
                    },
                    include: {
                        scheduleSettings: true, // Include related scheduleSettings in the response
                        timeslots: true, // Include related timeslots in the response
                    },
                });

                const unsuccessfulMigration = await this.migrateBookings(Bookings, calendarGroupId)
                for (const booking of unsuccessfulMigration) {
                    const petOwner = await PetOwnerService.getUserById(Number(booking.petOwnerId))
                    const emailTitle = "[Action Required] Reschedule Booking or Request for Refund"
                    await emailService.sendEmail(
                        petOwner.user.email,
                        emailTitle,
                        emailTemplate.rescheduleOrRefundBookingEmail(
                            petOwner.firstName,
                            "localhost:3002/customer/appointments",
                            booking
                        )
                    )
                }
            }

            return updatedCalendarGroup;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CalendarGroupError(error);
        }
    }

    async migrateBookings(bookings, calendarGroupId) {
        const unsuccessfulMigration = [];
        for (const existingBooking of bookings) {
            const { startTime, endTime, bookingId } = existingBooking;
            const bookingDuration = Math.abs((new Date(startTime) - new Date(endTime)) / 60000);
            const availableSlots = await this.getAvailability(Number(calendarGroupId), new Date(startTime), new Date(endTime), bookingDuration);

            if (availableSlots.length === 0) {
                unsuccessfulMigration.push(existingBooking);
                continue;
            } else {
                // Always choose the first available slot for simplicity.
                availableSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                const chosenSlot = availableSlots[0];

                await prisma.booking.update({
                    where: { bookingId: bookingId },
                    data: {
                        timeSlotId: chosenSlot.timeSlotId,
                        lastUpdated: new Date()
                    }
                });
            }
        }
        return unsuccessfulMigration
    }

    formatDateKey(date) {
        return format(date, 'yyyy-MM-dd');
    }

    checkWeeklyOverlap(weeklySettings) {
        const dateMap = {};

        for (let setting of weeklySettings) {
            const { recurrence } = setting;
            const { startDate, endDate } = recurrence;
            const { days } = setting;

            let currentDate = new Date(startDate);
            while (differenceInDays(new Date(endDate), currentDate) >= 0) {
                const dayName = format(currentDate, 'EEEE').toUpperCase();
                if (days.includes(dayName)) {

                    // CHECK DATE OVERLAP; DATEMAP IS USED TO CHECK DATE OVERLAP 
                    if (dateMap[this.formatDateKey(currentDate)]) {
                        throw new CustomError(`Overlap detected for date ${currentDate} in weekly settings`, 400);
                    }

                    // CHECK TIMING OVERLAP; TIME PERIODS SHOULD NOT OVERLAP

                    dateMap[this.formatDateKey(currentDate)] = setting;
                }
                currentDate = addDays(currentDate, 1);
            }
        }

        return dateMap
    }

    checkDailyOverlap(dailySettings) {
        const dateMap = {};

        for (let setting of dailySettings) {
            const { recurrence } = setting;
            const { startDate, endDate } = recurrence;

            let currentDate = new Date(startDate);
            while (differenceInDays(new Date(endDate), currentDate) >= 0) {
                // CHECK DATE OVERLAP; DATEMAP IS USED TO CHECK DATE OVERLAP 
                if (dateMap[this.formatDateKey(currentDate)]) {
                    throw new CustomError(`Overlap detected for date ${currentDate} in daily settings`, 400);
                }

                // CHECK TIMING OVERLAP; TIME PERIODS SHOULD NOT OVERLAP; ALREADY DONE BY
                dateMap[this.formatDateKey(currentDate)] = setting;

                currentDate = addDays(currentDate, 1);
            }
        }

        return dateMap
    }


    generateTimeSlotsForDate(dateString, timePeriods) {
        const slotsForDate = [];

        for (let period of timePeriods) {
            const startTime = parseISO(`${dateString}T${period.startTime}`);
            const endTime = parseISO(`${dateString}T${period.endTime}`);
            const vacancies = period.vacancies

            // Create a TimeSlot object
            const timeSlot = {
                startTime: startTime,
                endTime: endTime,
                vacancies: vacancies
            };

            slotsForDate.push(timeSlot);
        }

        return slotsForDate;
    }


    async mapToTimeSlots(scheduleSettings) {
        // Separate settings by pattern
        const weeklySettings = scheduleSettings.filter(s => s.recurrence.pattern === RecurrencePattern.WEEKLY);
        const dailySettings = scheduleSettings.filter(s => s.recurrence.pattern === RecurrencePattern.DAILY);

        // Check overlaps for WEEKLY first, then DAILY
        const weeklyDateMap = this.checkWeeklyOverlap(weeklySettings);
        const dailyDateMap = this.checkDailyOverlap(dailySettings);

        // Merge and override with daily settings if there's any overlap
        const dateMap = { ...weeklyDateMap, ...dailyDateMap };
        const timeSlots = [];

        // For each dateMap Key: Value (date: setting), generate timeslots
        for (let dateString in dateMap) {
            const setting = dateMap[dateString];
            const slotsForDate = this.generateTimeSlotsForDate(dateString, setting.recurrence.timePeriods, setting.vacancies);
            timeSlots.push(...slotsForDate);
        }
        return timeSlots;
    }

    async mapToScheduleSettings(scheduleSettings) {
        return scheduleSettings.map(slot => {
            const { recurrence } = slot;
            return {
                pattern: recurrence.pattern,
                days: slot.days || [], // adding default value in case 'days' is not provided
                vacancies: slot.vacancies,
                startDate: recurrence.startDate,
                endDate: recurrence.endDate,
                timePeriods: {
                    create: recurrence.timePeriods.map(period => ({
                        startTime: period.startTime,
                        endTime: period.endTime,
                        vacancies: period.vacancies
                    }))
                }
            };
        });
    }


}

module.exports = new CalendarGroupService();  // Exporting an instance of the service for usage
