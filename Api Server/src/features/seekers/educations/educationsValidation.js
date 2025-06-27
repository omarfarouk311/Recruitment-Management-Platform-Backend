const { body, param } = require('express-validator')

const validateEducationName = () =>
    body('school_name')
        .isString()
        .notEmpty()
        .isLength({ min: 1, max: 100 })
        .withMessage('School name must be between 1 and 100 characters');

const validateFieldName = () =>
    body('field')
        .isString()
        .notEmpty()
        .isLength({ min: 1, max: 100 })
        .withMessage('Field of study must be between 1 and 100 characters');

const validateDegree = () =>
    body('degree')
        .isString()
        .notEmpty()
        .isLength({ min: 1, max: 100 })
        .withMessage('Degree must be between 1 and 100 characters');

const validateGrade = () =>
    body('grade')
        .isString()
        .notEmpty()
        .isLength({ min: 1, max: 10 })
        .withMessage('Grade must be between 1 and 10 characters');

const validateStartDate = () =>
    body('start_date', 'Start date is required')
        .notEmpty()
        .isISO8601()
        .withMessage('Start date must be ISO string')
        .toDate();

const validateEndDate = () =>
    body('end_date', 'End date is required')
        .notEmpty()
        .isISO8601()
        .withMessage('End date must be ISO string')
        .toDate();

module.exports.validateEducationId = param('educationId').notEmpty().withMessage('Education Id is required').bail().isInt().toInt().withMessage("Education Id should be integer");

module.exports.validateSeekerId = param('seekerId').notEmpty().withMessage('Seeker Id is required').bail().isInt().toInt().withMessage("Seeker Id should be integer");

module.exports.validateEducation = [
    validateEducationName(),
    validateFieldName(),
    validateDegree(),
    validateGrade(),
    validateStartDate(),
    validateEndDate(),
]