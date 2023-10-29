const cron = require('node-cron');
const prisma = require("../../../../prisma/prisma");
const featuredServiceListingService = require('../api/services/serviceListing/featuredServiceListing');
const dateService = require('../utils/date');

// Define the schedule for the cron job to run every Sunday at midnight
// Start and end dates for the validity period is Sunday 00:00:00 to Saturday 23:59:59
cron.schedule('0 0 * * 0', async () => {
  try {
    const currentDate = new Date();
    const { startDate, endDate } = dateService.getCurrentWeekStartAndEndDatesFromToday(currentDate);
    await featuredServiceListingService.getFeaturedListingsForTimePeriod(currentDate, startDate, endDate, 6);

    console.log(`Featured Listing Sets created successfully for period between ${startDate} and ${endDate}`);
} catch (error) {
    console.error(`Error creating featured listing sets for period between ${startDate} and ${endDate}:`, error);
  }
});

cron.start();


