const { body } = require('express-validator');
const { minDescriptionLength, maxDescriptionLength } = require('../../../config/config');

const validateJobId = () => body('jobId')
    .custom(value => typeof value === 'number' && value > 0)
    .withMessage('jobId must get passed in the request body with value greater than 0');

const validateTitle = () => body('title')
    .isString()
    .withMessage('title must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('title length must be between 1 and 50');

const validateDescription = () => body('description')
    .isString()
    .withMessage('description must be a string')
    .isLength({ min: minDescriptionLength, max: maxDescriptionLength })
    .withMessage(`title length must be between ${minDescriptionLength} and ${maxDescriptionLength}`);

exports.validateCreateReport = [validateJobId(), validateTitle(), validateDescription()];
