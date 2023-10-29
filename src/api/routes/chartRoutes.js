const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController')

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok chart API is working 🚀' });
});

function registerChartRoutes(controller) {
    // admin charts
    router.get(`/admin`, controller.adminCharts)

}

registerChartRoutes(chartController);

module.exports = router;