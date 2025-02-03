const { validationResult, query, buildCheckFunction } = require('express-validator');
const checkCompanyId = buildCheckFunction(['body', 'params']);

const validateCompanyId = () => checkCompanyId('companyId')
    .trim()
    .notEmpty()
    .withMessage("Company ID must be passed as a route patameter")
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Invalid Company ID")
    .toInt();

const validatePage = () => query('page')
    .trim()
    .notEmpty()
    .withMessage("Page number must be passed as a query patameter")
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Invalid page number")
    .toInt();

const validateRating = () => query('rating')
    .optional()
    .trim()
    .isInt({ min: 2, max: 4, allow_leading_zeroes: false })
    .withMessage("Invalid rating option")
    .toInt();

const validateSortByRating = () => query('sortByRating', "Invalid sort option")
    .optional()
    .trim()
    .custom((value, { req }) => req.query.sortByDate === undefined)
    .withMessage("Sort is only allowed by one option at a time")
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1);

const validateSortByDate = () => query('sortByDate', "Invalid sort option")
    .optional()
    .trim()
    .custom((value, { req }) => req.query.sortByRating === undefined)
    .withMessage("Sort is only allowed by one option at a time")
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1);

exports.validateGetReviews = [validateCompanyId(), validatePage(), validateRating(), validateSortByDate(), validateSortByRating()];

exports.handleValidationErrors = (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors = errors.mapped();
        return next(errors);
    }

    next();
};