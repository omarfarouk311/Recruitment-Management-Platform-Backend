const { body, param } = require('express-validator');

exports.addExperienceValidator = [
    body('companyName', 'Company name is required and must be a string')
        .isString()
        .notEmpty(),
    body('jobTitle', 'Job title is required and must be a string')
        .isString()
        .notEmpty(),
    body('startDate', 'Start date must be a string if provided')
        .optional()
        .isISO8601()
        .toDate(),
    body('endDate', 'End date must be a string if provided')
        .optional()
        .isISO8601()
        .toDate(),
    body('description', 'Description must be a string if provided')
        .optional()
        .isString(),
    body('country', 'Country must be a string if provided')
        .optional()
        .isString(),
    body('city', 'City must be a string if provided')
        .optional()
        .isString()
];

exports.updateExperienceValidator = [
    param('experienceId').isInt().withMessage('Experience ID must be an integer'),
    body('companyName').isString().notEmpty().withMessage('Company name is required'),
    body('jobTitle').isString().notEmpty().withMessage('Job title is required'),
    body('startDate').optional().isString(),
    body('endDate').optional().isString(),
    body('description').optional().isString(),
    body('country').optional().isString(),
    body('city').optional().isString()
];

exports.validateUserId = [
    param('userId').isInt().withMessage('User ID must be an integer')
];

exports.validateExperienceId = [
    param('experienceId').isInt().withMessage('Experience ID must be an integer')
];