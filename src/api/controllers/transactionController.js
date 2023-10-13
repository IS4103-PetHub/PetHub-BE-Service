const transactionService = require('../services/finance/transactionService');
const orderItemService = require('../services/finance/orderItemService');
const constants = require("../../constants/common");
const baseValidations = require('../validations/baseValidation')
const errorMessages = constants.errorMessages;
const orderItemValidations = require('../validations/orderItemValidations')

exports.getPetOwnerOrderItemsById = async (req, res, next) => {
    try {
        const petOwnerId = req.params.petOwnerId; // must be valid number
        if (!(await baseValidations.isValidInteger(petOwnerId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const statusFilters = req.query.statusFilter;
        let statusFilterArray = undefined;
        if (statusFilters) {
            if (!orderItemValidations.validateStatusFilters(statusFilters)) return res.status(400).json({ message: "invalid statusFilter query" })
            statusFilterArray = statusFilters.split(',');
        }

        const orderItems = await orderItemService.getPetOwnerOrderItemsById(Number(petOwnerId), statusFilterArray)
        res.status(200).json(orderItems)
    } catch (error) {
        next(error)
    }
}


exports.getPetBusinessOrderItemsById = async (req, res, next) => {
    try {
        const petBusinessId = req.params.petBusinessId; // must be valid number
        if (!(await baseValidations.isValidInteger(petBusinessId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const statusFilters = req.query.statusFilter;
        let statusFilterArray = undefined;
        if (statusFilters) {
            if (!orderItemValidations.validateStatusFilters(statusFilters)) return res.status(400).json({ message: "invalid statusFilter query" })
            statusFilterArray = statusFilters.split(',');
        }

        const orderItems = await orderItemService.getPetBusinessOrderItemsById(Number(petBusinessId), statusFilterArray)
        res.status(200).json(orderItems)
    } catch (error) {
        next(error)
    }
}

exports.getAllOrderItems = async (req, res, next) => {
    try {

    } catch (error) {
        next(error)
    }
}