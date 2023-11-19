const express = require('express');
const router = express.Router();
const commissionRuleController = require('../controllers/commissionRuleController')

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Commission Rule API is working 🚀' });
});


function registerCommissionRuleRoutes(controller) {
    router.get(`/`, controller.getAllCommissionRules);
    router.get(`/:commissionRuleId`, controller.getCommissionRuleById);
    router.post(`/`, controller.createCommissionRule);
    router.patch(`/:commissionRuleId`, controller.updateCommissionRule);
    router.delete(`/:commissionRuleId`, controller.deleteCommissionRule);
}

registerCommissionRuleRoutes(commissionRuleController);

module.exports = router;