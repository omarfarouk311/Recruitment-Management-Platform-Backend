const { param,body,query, buildCheckFunction } = require('express-validator');
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

exports.createReviewValidator = [
    body('title').isString().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('role').isString().isLength({ min: 1 }).withMessage('Role is required')
];


exports.updateReviewValidator = [
    param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
    body('title').isString().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('role').isString().isLength({ min: 1 }).withMessage('Role is required')
];

exports.deleteReviewValidator = [
    param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer')
];

exports.validateGetReviews = [validateCompanyId, validatePage(), validateRating(), validateSortByDate(), validateSortByRating()];
