const commissionRuleService = require('../services/finance/commissionRuleService');
const commissionRuleValidations = require('../validations/commissionRuleValidation')
const baseValidations = require('../validations/baseValidation')
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;

exports.getAllCommissionRules = async (req, res, next) => {
    try {
        const commissionRules = await commissionRuleService.getAllCommissionRules()
        res.status(200).json(commissionRules);
    } catch (error) {
        next(error);
    }
};

exports.getCommissionRuleById = async (req, res, next) => {
    try {
        const commissionRuleId = req.params.commissionRuleId; // must be valid number
        if (!(await baseValidations.isValidInteger(commissionRuleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const commissionRule = await commissionRuleService.getCommissionRuleById(Number(commissionRuleId))
        res.status(200).json(commissionRule);
    } catch (error) {
        next(error);
    }
};

exports.createCommissionRule = async (req, res, next) => {
    try {
        const payload = req.body
        const validationResult = commissionRuleValidations.isValidCommissionRulePayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const newCommissionRule = await commissionRuleService.createCommissionRule(payload);
        res.status(201).json(newCommissionRule);
    } catch (error) {
        next(error);
    }
};

exports.updateCommissionRule = async (req, res, next) => {
    try {
        const commissionRuleId = req.params.commissionRuleId; // must be valid number
        if (!(await baseValidations.isValidInteger(commissionRuleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const payload = req.body
        const validationResult = commissionRuleValidations.isValidUpdateCommissionRulePayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const updatedCommissionRule = await commissionRuleService.updateCommissionRule(Number(commissionRuleId), payload);
        res.status(200).json(updatedCommissionRule);
    } catch (error) {
        next(error);
    }
};

exports.deleteCommissionRule = async (req, res, next) => {
    try {
        const commissionRuleId = req.params.commissionRuleId; // must be valid number
        if (!(await baseValidations.isValidInteger(commissionRuleId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        await commissionRuleService.deleteCommissionRule(Number(commissionRuleId));
        res.status(200).json({ message: 'Commission rule deleted successfully.' });
    } catch (error) {
        next(error);
    }
};