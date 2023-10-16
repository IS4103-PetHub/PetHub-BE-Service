const orderItemService = require('../services/finance/orderItemService');
const constants = require("../../constants/common");
const baseValidations = require('../validations/baseValidation')
const errorMessages = constants.errorMessages;
const orderItemValidations = require('../validations/orderItemValidations')


exports.getOrderItemsById = async (req, res, next) => {
    try {
        const orderItemId = req.params.orderItemId; // must be valid number
        if (!(await baseValidations.isValidInteger(orderItemId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const orderItem = await orderItemService.getOrderItemById(Number(orderItemId))
        res.status(200).json(orderItem)
    } catch (error) {
        next(error)
    }
}

exports.getAllOrderItems = async (req, res, next) => {
    try {
        const statusFilters = req.query.statusFilter;
        let statusFilterArray = undefined;
        if (statusFilters) {
            if (!orderItemValidations.validateStatusFilters(statusFilters)) return res.status(400).json({ message: "invalid statusFilter query" })
            statusFilterArray = statusFilters.split(',');
        }

        const orderItems = await orderItemService.getAllOrderItems(statusFilterArray)
        res.status(200).json(orderItems)
    } catch (error) {
        next(error)
    }
}



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

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        if (startDate && endDate) {
            if (!(baseValidations.dateTimeValidation(startDate) && baseValidations.dateTimeValidation(endDate))) 
                return res.status(400).json({ message: "invalid start and end Date" })
            if(new Date(startDate) > new Date(endDate)) 
                return res.status(400).json({ message: "start date must be before end date" })
        }

        const serviceListingFilters = req.query.serviceListingFilters;
        let serviceListingFilterArray = undefined;
        if (serviceListingFilters) {
            // validate 
            if(!(orderItemValidations.validateNumberList(serviceListingFilters))) 
                return res.status(400).json({ message: "invalid serviceListingFilter query" })
            serviceListingFilterArray = serviceListingFilters.split(',');
        }

        const orderItems = await orderItemService.getPetBusinessOrderItemsById(Number(petBusinessId), statusFilterArray, startDate, endDate, serviceListingFilterArray)
        res.status(200).json(orderItems)
    } catch (error) {
        next(error)
    }
}