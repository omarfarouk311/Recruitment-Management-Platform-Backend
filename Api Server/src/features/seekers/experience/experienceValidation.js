const { body, param } = require('express-validator');

exports.addExperienceValidator = [
    body('companyName').isString().notEmpty().withMessage('Company name is required'),
    body('jobTitle').isString().notEmpty().withMessage('Job title is required'),
    body('startDate').optional().isString(),
    body('endDate').optional().isString(),
    body('description').optional().isString(),
    body('country').optional().isString(),
    body('city').optional().isString()
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