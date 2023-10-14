const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController')

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Order Item API is working 🚀' });
});


function registerOrderItemRoutes(controller) {
    router.get('/', controller.getAllOrderItems);
    router.get('/:orderItemId', controller.getOrderItemsById);
    router.get('/pet-owners/:petOwnerId', controller.getPetOwnerOrderItemsById);
    router.get('/pet-businesses/:petBusinessId', controller.getPetBusinessOrderItemsById);
}

registerOrderItemRoutes(transactionController);

module.exports = router;