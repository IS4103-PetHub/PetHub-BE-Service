const express = require('express');
const router = express.Router();
const calendarGroupController = require('../controllers/calendarGroupController')
// TODO add calendarGroup Controller

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Calendar Group API is working 🚀' });
});


function registerCalendarGroupRoutes(controller) {
    router.get(`/`, controller.getAllCalendarGroups);
    router.get(`/:calendarGroupId`, controller.getCalendarGroupById);
    router.post(`/`, controller.createCalendarGroup);
    router.put(`/:calendarGroupId`, controller.updateCalendarGroup);
    router.delete(`/:calendarGroupId`, controller.deleteCalendarGroup);

    // Utility Routes
    router.get('/available-timeslots/:calendarID', controller.getAvailability);
}

registerCalendarGroupRoutes(calendarGroupController);

module.exports = router;