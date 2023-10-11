const CalendarGroupService = require("../../../src/api/services/appointments/calendarGroupService");
const BookingService = require("../../../src/api/services/appointments/bookingService");

/* Seeding helpers functions for CG */

const formatDate = (date) => {
  // Format the date to YYYY-MM-DD without the dayjs module
  let yyyy = date.getFullYear();
  let mm = String(date.getMonth() + 1).padStart(2, "0");
  let dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Get a date x days from now
const getSuitableDate = (daysAhead) => {
  let date = new Date();
  date.setDate(date.getDate() + (daysAhead || 1)); // start date must be at least 1 day ahead from today
  return formatDate(date);
};

// Get a date x weeks from now for a specific day of the week (used primarily for simulating a public holiday half day)
const getSuitableSpecialDate = (dayOfWeek, weeksAhead) => {
  let date = new Date();
  let day = date.getDay(); // 1 is Monday, 2 is Tuesday, etc
  let diff = dayOfWeek - day;
  if (diff < 0) {
    diff += 7;
  }
  date.setDate(date.getDate() + diff + 7 * (weeksAhead || 1));
  return formatDate(date);
};

// Generate booking time string based on a date string and SGT time [dateString format: YYYY-MM-DD, timeString format: HH:MM]
const generateBookingTime = (dateString, timeString) => {
  const sgtDate = new Date(`${dateString}T${timeString}:00+08:00`);
  return sgtDate.toISOString();
};

const calendarGroupPayloads = [
  {
    name: "Johns Company Normal grooming facilities schedule",
    description:
      "Available slots for grooming services. More groomers available in the afternoon and the earliest Thursday 1 week from now is a public holiday.",
    scheduleSettings: [
      {
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(),
          endDate: getSuitableDate(50),
          timePeriods: [
            {
              startTime: "09:00",
              endTime: "10:00",
              vacancies: 1,
            },
            {
              startTime: "10:00",
              endTime: "11:00",
              vacancies: 2,
            },
            {
              startTime: "13:00",
              endTime: "14:00",
              vacancies: 2,
            },
            {
              startTime: "14:00", // More groomers available in the afternoon
              endTime: "17:00",
              vacancies: 3,
            },
          ],
        },
      },
      {
        recurrence: {
          pattern: "DAILY",
          startDate: getSuitableSpecialDate(4, 1), // Pretend the earliest Thursday 1 week from now is a public holiday
          endDate: getSuitableSpecialDate(4, 1),
          timePeriods: [
            {
              startTime: "09:00",
              endTime: "11:00",
              vacancies: 1,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Johns company VIP grooming facilities schedule",
    description:
      "Available slots for grooming services: After 1 week the VIP groomer is also available to work on Sundays for a while. \
      After a month the VIP groomer can only do weekends, but a new VIP groomer is hired then",
    scheduleSettings: [
      {
        days: ["THURSDAY", "FRIDAY", "SATURDAY"],
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(),
          endDate: getSuitableDate(14),
          timePeriods: [
            {
              startTime: "12:00",
              endTime: "15:00",
              vacancies: 1,
            },
          ],
        },
      },
      {
        days: ["SUNDAY"], // After 1 week the VIP groomer is also available to work on Sundays for a while
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(7),
          endDate: getSuitableDate(30),
          timePeriods: [
            {
              startTime: "12:00",
              endTime: "15:00",
              vacancies: 1,
            },
          ],
        },
      },
      {
        days: ["SATURDAY", "SUNDAY"], // After a month the VIP groomer can only do weekends :(, but hey a new VIP groomer is slated to join then
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(31),
          endDate: getSuitableDate(50),
          timePeriods: [
            {
              startTime: "10:00",
              endTime: "15:00",
              vacancies: 2,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Johns Company testing out their vet services schedule",
    description:
      "Available slots for vet services. Currently theres only 1 vet at work though, its John himself. \
      He works alternate weekdays for a month, but wants to go golfing next Wednesday in the morning. \
      In a months time, john wants the vet service to operate for a full week, this is because this time of the year there tend to be more pet injuries. \
      After that john wants to get back to his usual schedule, but oh he hired a new vet that is slated to start work on this day.",
    scheduleSettings: [
      {
        days: ["MONDAY", "WEDNESDAY", "FRIDAY"],
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(),
          endDate: getSuitableDate(30),
          timePeriods: [
            {
              startTime: "09:30",
              endTime: "13:30",
              vacancies: 1,
            },
          ],
        },
      },
      {
        recurrence: {
          pattern: "DAILY",
          startDate: getSuitableSpecialDate(3, 0), // John wants to go golfing on the next Wednesday in the morning
          endDate: getSuitableSpecialDate(3, 0),
          timePeriods: [
            {
              startTime: "12:30",
              endTime: "13:30",
              vacancies: 1,
            },
          ],
        },
      },
      {
        recurrence: {
          pattern: "DAILY",
          startDate: getSuitableDate(31), // In a month's time, john wants the vet service to operate for a full week, this is because this time of the year there tend to be more pet injuries
          endDate: getSuitableDate(37),
          timePeriods: [
            {
              startTime: "09:30",
              endTime: "11:00",
              vacancies: 1,
            },
            {
              startTime: "12:00",
              endTime: "13:30",
              vacancies: 1,
            },
            {
              startTime: "15:00",
              endTime: "18:00",
              vacancies: 1,
            },
          ],
        },
      },
      {
        days: ["MONDAY", "WEDNESDAY", "FRIDAY"], // Then john wants to get back to his usual schedule, but oh he hired a new vet that starts work on this day
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(38),
          endDate: getSuitableDate(60),
          timePeriods: [
            {
              startTime: "09:30",
              endTime: "13:30",
              vacancies: 2,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Johns Pet boarding schedule",
    description:
      "Johns daily pet boarding schedule in preparation for the launch of johns new pet daycare service listing",
    scheduleSettings: [
      {
        recurrence: {
          pattern: "DAILY",
          startDate: getSuitableDate(7),
          endDate: getSuitableSpecialDate(60),
          timePeriods: [
            {
              startTime: "07:00",
              endTime: "20:00",
              vacancies: 10,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Johns dog sitting schedule",
    description:
      "John has some free time on wednesdays and saturdays in the evening and wants to do some dog sitting",
    scheduleSettings: [
      {
        days: ["WEDNESDAY", "SATURDAY"],
        recurrence: {
          pattern: "WEEKLY",
          startDate: getSuitableDate(-30),
          endDate: getSuitableDate(60),
          timePeriods: [
            {
              startTime: "09:00",
              endTime: "18:00",
              vacancies: 1,
            },
          ],
        },
      },
    ],
  },
];

const bookingPayloads = [
  {
    bookingIndex: 1,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(3, 0), "09:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(3, 0), "10:00"),
  },
  {
    bookingIndex: 2,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(3, 0), "10:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(3, 0), "11:00"),
  },
  {
    bookingIndex: 3,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 0), "13:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(5, 0), "14:00"),
  },
  {
    bookingIndex: 4,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 0), "15:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(5, 0), "16:00"),
  },
  {
    bookingIndex: 5,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 0), "16:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(5, 0), "17:00"),
  },
  {
    bookingIndex: 6,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 5), "09:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(1, 5), "10:00"),
  },
  {
    bookingIndex: 7,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 5), "14:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(1, 5), "15:00"),
  },
  {
    bookingIndex: 8,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 5), "15:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(2, 5), "17:00"),
  },
  {
    bookingIndex: 9,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(3, 2), "09:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(3, 2), "10:00"),
  },
  {
    bookingIndex: 9,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(3, 2), "10:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(3, 2), "11:00"),
  },
  {
    bookingIndex: 9,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(3, 2), "10:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(3, 2), "11:00"),
  },
  {
    bookingIndex: 10,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(4, 2), "13:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(4, 2), "14:00"),
  },
  {
    bookingIndex: 11,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(4, 2), "15:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(4, 2), "17:00"),
  },
  {
    bookingIndex: 12,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 2), "13:00"), // Normal grooming waterslide experience
    endTime: generateBookingTime(getSuitableSpecialDate(5, 2), "14:00"),
  },
  {
    bookingIndex: 13,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 3), "10:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(1, 3), "11:00"),
  },
  {
    bookingIndex: 14,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 3), "13:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(1, 3), "14:00"),
  },
  {
    bookingIndex: 15,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 3), "14:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(2, 3), "17:00"),
  },
  {
    bookingIndex: 16,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 3), "13:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(2, 3), "14:00"),
  },
  {
    bookingIndex: 17,
    calendarGroupId: 1,
    serviceListingId: 1,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 4), "13:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(2, 4), "14:00"),
  },
  {
    bookingIndex: 18,
    calendarGroupId: 1,
    serviceListingId: 8,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 4), "14:00"), // Normal grooming fun times
    endTime: generateBookingTime(getSuitableSpecialDate(2, 4), "15:00"),
  },
  {
    bookingIndex: 19,
    calendarGroupId: 2,
    serviceListingId: 9,
    startTime: generateBookingTime(getSuitableSpecialDate(4, 0), "12:00"), // VIP grooming ninja offering
    endTime: generateBookingTime(getSuitableSpecialDate(4, 0), "14:00"),
  },
  {
    bookingIndex: 20,
    calendarGroupId: 2,
    serviceListingId: 9,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 0), "14:00"), // VIP grooming ninja offering
    endTime: generateBookingTime(getSuitableSpecialDate(5, 0), "15:00"),
  },
  {
    bookingIndex: 21,
    calendarGroupId: 2,
    serviceListingId: 9,
    startTime: generateBookingTime(getSuitableSpecialDate(7, 2), "12:00"), // VIP grooming ninja offering
    endTime: generateBookingTime(getSuitableSpecialDate(7, 2), "13:00"),
  },
  {
    bookingIndex: 22,
    calendarGroupId: 2,
    serviceListingId: 9,
    startTime: generateBookingTime(getSuitableSpecialDate(7, 2), "13:00"), // VIP grooming ninja offering
    endTime: generateBookingTime(getSuitableSpecialDate(7, 2), "14:00"),
  },
  {
    bookingIndex: 23,
    calendarGroupId: 3,
    serviceListingId: 10,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 0), "09:30"), // John's new vet experiment
    endTime: generateBookingTime(getSuitableSpecialDate(1, 0), "10:30"),
  },
  {
    bookingIndex: 24,
    calendarGroupId: 3,
    serviceListingId: 10,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 0), "12:00"), // John's new vet experiment
    endTime: generateBookingTime(getSuitableSpecialDate(1, 0), "13:00"),
  },
  {
    bookingIndex: 25,
    calendarGroupId: 3,
    serviceListingId: 10,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 0), "10:00"), // John's new vet experiment
    endTime: generateBookingTime(getSuitableSpecialDate(5, 0), "11:00"),
  },
  {
    bookingIndex: 26,
    calendarGroupId: 3,
    serviceListingId: 10,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 1), "11:00"), // John's new vet experiment
    endTime: generateBookingTime(getSuitableSpecialDate(5, 1), "12:00"),
  },
  {
    bookingIndex: 27,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 1), "11:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(1, 1), "12:00"),
  },
  {
    bookingIndex: 28,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 1), "12:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(1, 1), "13:00"),
  },
  {
    bookingIndex: 29,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 1), "13:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(1, 1), "14:00"),
  },
  {
    bookingIndex: 30,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 1), "11:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(1, 1), "12:00"),
  },
  {
    bookingIndex: 31,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(1, 1), "12:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(1, 1), "13:00"),
  },
  {
    bookingIndex: 32,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(5, 1), "13:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(5, 1), "14:00"),
  },
  {
    bookingIndex: 33,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "15:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "16:00"),
  },
  {
    bookingIndex: 34,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "15:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "16:00"),
  },
  {
    bookingIndex: 35,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "16:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "17:00"),
  },
  {
    bookingIndex: 36,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "17:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "18:00"),
  },
  {
    bookingIndex: 37,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "18:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "19:00"),
  },
  {
    bookingIndex: 38,
    calendarGroupId: 4,
    serviceListingId: 2,
    startTime: generateBookingTime(getSuitableSpecialDate(2, 1), "19:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(2, 1), "20:00"),
  }
];

const pastBookingsPayload =[
  {
    bookingIndex: 39,
    calendarGroupId: 5,
    serviceListingId: 16,
    startTime: generateBookingTime(getSuitableSpecialDate(3, -2), "09:00"), // John's pet boarding schedule
    endTime: generateBookingTime(getSuitableSpecialDate(3, -2), "12:00"),
  }
]

/* For PB with ID: 1, email: biz1@example.com, password: password1234 */
async function seedCalendarGroup() {
  /*
    Save the original console.log and override it to do nothing,
    this is because we want to avoid bombing the terminal from the console.log in the createCG service function in the event of an error
  */
  const originalLog = console.log;
  console.log = () => {};

  for (const payload of calendarGroupPayloads) {
    try {
      await CalendarGroupService.createCalendarGroup(payload, 1);
    } catch (error) {
      console.log = originalLog; // Restore console.log so I can print the shortened log below
      console.log(
        `Error seeding calendar group with name: ${payload.name}. It is possible that this calendar group already exists.`
      );
      console.log = () => {}; // Override console.log to do nothing again
    }
  }
  console.log = originalLog; // Restore console.log after the loop
}

const userIdToPetIdMap = {
  9: 1, 
  11: 3, 
  12: 4,
  13: 7,
  15: 8,
  16: 9,
  17: 10 
};

/* For PO with ID: 12, email: petowner5@example.com, password: ilovepets */
async function seedBookings() {
  const originalLog = console.log;
  console.log = () => {};

  for (const payload of bookingPayloads) {
    try {

      // randomly genereate from userId 9 to 17
      const userId = Math.floor(Math.random() * (17 - 9 + 1)) + 9;
      const petId = userIdToPetIdMap[userId];

      await BookingService.createBooking(
        userId,
        payload.calendarGroupId,
        payload.serviceListingId,
        payload.startTime,
        payload.endTime,
        petId
      );
    } catch (error) {
      console.log = originalLog;
      console.log(
        `Error seeding booking for booking index: ${payload.bookingIndex}. It is possible that this booking already exists.`
      );
      console.log = () => {};
    }
  }

  for (const payload of pastBookingsPayload) {
    try {

      await BookingService.createBooking(
        18, // past booking for is4103pethub@gmail.com
        payload.calendarGroupId,
        payload.serviceListingId,
        payload.startTime,
        payload.endTime,
        null
      );
    } catch (error) {
      console.log = originalLog;
      console.log(
        `Error seeding past booking for booking index: ${payload.bookingIndex}. It is possible that this booking already exists.`
      );
      console.log = () => {};
    }
  }
  console.log = originalLog;
}

module.exports = { seedCalendarGroup, seedBookings };
