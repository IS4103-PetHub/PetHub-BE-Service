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
  // CG 1
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
  // CG 2
  {
    name: "Johns company VIP grooming facilities schedule",
    description:
      "Available slots for grooming services. After 1 week the VIP groomer is also available to work on Sundays for a while. \
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
  // CG 3
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
              endTime: "11:30",
              vacancies: 1,
            },
            {
              startTime: "12:30",
              endTime: "13:30",
              vacancies: 1,
            },
            {
              startTime: "15:30",
              endTime: "18:30",
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
  // CG 4
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
  // CG 5
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

module.exports = { seedCalendarGroup };
