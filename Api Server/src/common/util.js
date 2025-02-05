const { validationResult, query } = require('express-validator');

exports.validatePage = () => query('page')
    .trim()
    .notEmpty()
    .withMessage('page parameter must be passed as a query parameter')
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Invalid page number, it must be a positive number")
    .toInt();

exports.handleValidationErrors = (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        err.validationErrors = Object.values(err.mapped()).map(({ msg }) => msg);
        err.msg = 'Validation Error';
        err.status = 400;
        return next(err);
    }

    next();
};