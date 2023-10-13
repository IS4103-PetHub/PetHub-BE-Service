const BaseValidations = require("../validations/baseValidation");
const paymentsValidations = require("../validations/paymentsValidation");
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;
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


// exports.checkout = async (req, res, next) => {
//   try {
//     const {
//       paymentMethodId,
//       amount,
//       userId,
//       itemCount,
//       cartItems,
//     } = req.body;

//     if (!paymentMethodId || !amount || !userId || !itemCount || !cartItems) {
//       return res.status(400).json({ error: "Missing required fields!" });
//     }

//     const data = req.body;
//     // TODO: Find a way to valid paymentMethodId using stripe paymentMethod APIs, if possible
//     if (!(await BaseValidations.isValidInteger(data.userId))) {
//       return res.status(400).json({ message: errorMessages.INVALID_ID });
//     }
//     // amount is sent over in cents to be consistent with stripe's conventions
//     if (!(await BaseValidations.isValidInteger(data.amount)) ||
//         !(await BaseValidations.isValidInteger(data.itemCount)) 
//     ) {
//       return res.status(400).json({ message: "Amount and Item Count fields should be a valid integer!" });
//     }

//     const paymentIntent = await PaymentService.checkout(data);
//     res.json({ success: true, paymentIntent });

//   } catch (error) {
//     next(error);
//   }
// };

exports.refund = async (req, res, next) => {
  try {
    const data = req.body;
    if (!paymentMethodId || !amount) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    const refund = await PaymentService.refund(data);
    res.json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};
