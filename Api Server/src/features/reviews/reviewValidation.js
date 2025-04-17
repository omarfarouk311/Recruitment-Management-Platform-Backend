const { param, body } = require('express-validator');
const { maxNameLength, maxDescriptionLength } = require('../../../config/config');

const validateTitle = () => body('title')
    .isString()
    .withMessage('Title is required')
    .isLength({ min: 1, max: maxNameLength })
    .withMessage(`Title must be between 1 and ${maxNameLength} characters`);

const validateDecription = () => body('description')
    .isString()
    .withMessage('Description is required')
    .isLength({ min: 1, max: maxDescriptionLength })
    .withMessage(`Description must be between 1 and ${maxDescriptionLength} characters`);

const validateRating = () => body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5');

const validateRole = () => body('role')
    .isString()
    .withMessage('Role is required')
    .isLength({ min: 1, max: maxNameLength })
    .withMessage(`Role must be between 1 and ${maxNameLength} characters`);

const validateCompanyId = () => body('companyId')
    .isInt({ min: 1 })
    .withMessage('Invalid company ID')
    .toInt();

const validateReviewId = () => param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Invalid review ID')
    .toInt();

exports.createReviewValidator = [
    validateTitle(),
    validateDecription(),
    validateRating(),
    validateRole(),
    validateCompanyId()
];

exports.updateReviewValidator = [
    validateReviewId(),
    validateTitle(),
    validateDecription(),
    validateRating(),
    validateRole()
];

exports.deleteReviewValidator = validateReviewId();