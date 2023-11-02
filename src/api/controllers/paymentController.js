const paymentsValidations = require("../validations/paymentsValidation");
const PaymentService = require("../services/paymentService.js");

exports.checkout = async (req, res, next) => {
  try {
    const payload = req.body
    const validationResult = paymentsValidations.isValidCheckoutPayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const confirmedInvoice = await PaymentService.checkout(payload);
    // res.json({ success: true, paymentIntent });
    res.status(200).json(confirmedInvoice)
  } catch (error) {
    next(error);
  }
};