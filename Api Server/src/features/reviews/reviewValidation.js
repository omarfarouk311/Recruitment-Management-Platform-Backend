const { query, buildCheckFunction } = require('express-validator');
const { validatePage } = require('../../common/util');
const { validateCompanyId } = require('../companies/companyValidation')

const validateRating = () => query('rating')
    .optional()
    .trim()
    .isInt({ allow_leading_zeroes: false, min: 1, max: 5 })
    .withMessage("Invalid rating option, it must be a number between 1 and 5")
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
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1);

exports.validateGetReviews = [validateCompanyId, validatePage(), validateRating(), validateSortByDate(), validateSortByRating()];
