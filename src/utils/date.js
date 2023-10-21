// Function to calculate the 1 week validity period 
// currentDate is a sunday. 
// startDate should be Sunday 00:00:00 -> Day 0
// endDate should be Saturday 23:59:59 -> Day 6
function getCurrentWeekDates(currentDate) {
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

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

// Function to get a random date between the current date and a date 3 weeks ago
function getRandomPastDate(currentDate) {
  const threeWeeksAgo = new Date(currentDate);
  threeWeeksAgo.setDate(currentDate.getDate() - 21);
  const randomTimestamp = threeWeeksAgo.getTime() + Math.random() * (currentDate.getTime() - threeWeeksAgo.getTime());
  const randomPastDate = new Date(randomTimestamp);

  return randomPastDate;
}

// Function to get a random future date, between 6-12 weeks from the current date
function getRandomFutureDate(currentDate) {
const randomFutureDate = new Date(currentDate);
  const daysToAdd = Math.floor(Math.random() * 42) + 42; // Random value between 42 and 84 (6 to 12 weeks)
  randomFutureDate.setDate(currentDate.getDate() + daysToAdd);

  return randomFutureDate;
}

module.exports = {
getCurrentWeekDates,
getPreviousWeekDates,
  getRandomPastDate,
  getRandomFutureDate,
};
