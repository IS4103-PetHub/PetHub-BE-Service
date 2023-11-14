const orderItemService = require('../services/finance/orderItemService');
const revenueService = require('../services/finance/revenueService')
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

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        if (startDate && endDate) {
            if (!(baseValidations.dateTimeValidation(startDate) && baseValidations.dateTimeValidation(endDate)))
                return res.status(400).json({ message: "invalid start and end Date" })
            if (new Date(startDate) > new Date(endDate))
                return res.status(400).json({ message: "start date must be before end date" })
        }

        const serviceListingFilters = req.query.serviceListingFilters;
        let serviceListingFilterArray = undefined;
        if (serviceListingFilters) {
            // validate 
            if (!(orderItemValidations.validateNumberList(serviceListingFilters)))
                return res.status(400).json({ message: "invalid serviceListingFilter query" })
            serviceListingFilterArray = serviceListingFilters.split(',');
        }

        const petBusinessFilter = req.query.petBusinessFilter;
        if (petBusinessFilter && !(await baseValidations.isValidInteger(petBusinessFilter))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const orderItems = await orderItemService.getAllOrderItems(
            statusFilterArray,
            startDate,
            endDate,
            serviceListingFilterArray,
            Number(petBusinessFilter))
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
            if (new Date(startDate) > new Date(endDate))
                return res.status(400).json({ message: "start date must be before end date" })
        }

        const serviceListingFilters = req.query.serviceListingFilters;
        let serviceListingFilterArray = undefined;
        if (serviceListingFilters) {
            // validate 
            if (!(orderItemValidations.validateNumberList(serviceListingFilters)))
                return res.status(400).json({ message: "invalid serviceListingFilter query" })
            serviceListingFilterArray = serviceListingFilters.split(',');
        }

        const orderItems = await orderItemService.getPetBusinessOrderItemsById(
            Number(petBusinessId),
            statusFilterArray,
            startDate,
            endDate,
            serviceListingFilterArray)
        res.status(200).json(orderItems)
    } catch (error) {
        next(error)
    }
}

exports.completeOrderItem = async (req, res, next) => {
    try {
        const orderItemId = req.params.orderItemId;
        const userId = req.body.userId;
        if (!(await baseValidations.isValidInteger(orderItemId)) || !(await baseValidations.isValidInteger(userId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }
        const voucherCode = req.body.voucherCode;

        const completedOrderItem = await orderItemService.completeOrderItem(Number(orderItemId), Number(userId), voucherCode)
        res.status(200).json(completedOrderItem)
    } catch (error) {
        next(error)
    }
}

exports.expireOrderItems = async (req, res, next) => {
    try {
        const beforeDate = req.query.beforeDate;
        if (beforeDate) {
            const validationResult = orderItemValidations.isValidExpireOrderItemPayload({ beforeDate: beforeDate });
            if (!validationResult.isValid) {
                return res.status(400).json({ error: validationResult.message });
            }
        }

        const expiredOrderItems = await orderItemService.expireOrderItems(beforeDate)
        res.status(200).json(expiredOrderItems)
    } catch (error) {
        next(error)
    }
}

exports.payoutOrderItems = async (req, res, next) => {
    try {
        const payoutDate = req.query.payoutDate;
        if (payoutDate) {
            const validationResult = orderItemValidations.isValidPayoutOrderItemPayload({ payoutDate: payoutDate });
            if (!validationResult.isValid) {
                return res.status(400).json({ error: validationResult.message });
            }
        }

        const paidoutOrderItems = await revenueService.payoutOrderItems(payoutDate)
        res.status(200).json(paidoutOrderItems)
    } catch (error) {
        next(error)
    }
}

exports.getPetBusinessPayoutInvoice = async (req, res, next) => {
    try {
        const petBusinessId = req.params.petBusinessId
        if (!await baseValidations.isValidInteger(petBusinessId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID} petBusinessId` });
        }

        const payoutInvoices = await revenueService.getPayoutInvoiceByPB(Number(petBusinessId))
        res.status(200).json(payoutInvoices)
    } catch(error) {
        next(error)
    }
}

exports.getPayoutInvoiceById = async (req, res, next) => {
    try {
        const payoutInvoiceId = req.params.payoutInvoiceId;
        if (!await baseValidations.isValidInteger(payoutInvoiceId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID} payoutInvoiceId` });
        }

        const payoutInvoice = await revenueService.getPayoutInvoiceById(Number(payoutInvoiceId));
        res.status(200).json(payoutInvoice)
    } catch(error) {
        next(error)
    }
}