
// Function to calculate the prev dates 1 week before
// startDate is Sunday 00:00:00 -> Day 7, endDate is 23:59:59 -> Day 13
// lastWeekStart is last Sunday 00:00:00 -> Day 0, endDate is last Saturday 23:59:59 -> Day 6
function getPreviousWeekDates(startDate, endDate) {
  const lastWeekStart = new Date(startDate);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7); // Go back 7 days for last Sunday
  lastWeekStart.setHours(0, 0, 0, 0);

  const lastWeekEnd = new Date(endDate);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7); // Go back 7 days for last Saturday
  lastWeekEnd.setHours(23, 59, 59, 999);

  return { lastWeekStart, lastWeekEnd };
}

// Function to calculate this week's start and end date
// If today is 25th Oct (Wed), this function should return thisWeekStart (Sunday 22nd, midnight) and thisWeekEnd (Saturday 28th, 2359) 
function getCurrentWeekStartAndEndDatesFromToday(today) {
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - (today.getDay() + 7) % 7); // Set to this Sunday

  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // Set to this Saturday

  thisWeekStart.setHours(0, 0, 0, 0);
  thisWeekEnd.setHours(23, 59, 59, 999);

  return { thisWeekStart, thisWeekEnd };
}

// Function to get a random date between the current date and (period) days ago
function getRandomPastDate(currentDate, period) {
  const threeWeeksAgo = new Date(currentDate);
  threeWeeksAgo.setDate(currentDate.getDate() - period);
  const randomTimestamp = threeWeeksAgo.getTime() + Math.random() * (currentDate.getTime() - threeWeeksAgo.getTime());
  const randomPastDate = new Date(randomTimestamp);

  return randomPastDate;
}

// Function to get a random future date, between 0-4 weeks from the current date
function getRandomFutureDate(currentDate) {
const randomFutureDate = new Date(currentDate);
  const daysToAdd = Math.floor(Math.random() * 28); // Random value between 0 - 4 weeks
  randomFutureDate.setDate(currentDate.getDate() + daysToAdd);

  return randomFutureDate;
}

module.exports = {
getPreviousWeekDates,
  getRandomPastDate,
  getRandomFutureDate,
  getCurrentWeekStartAndEndDatesFromToday,
};
