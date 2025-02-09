const { query, param, body } = require('express-validator');


const interviewQueryParametersValidation = [
    query('sort')
        .optional()
        .custom((value, { req }) => {
            if (Array.isArray(req.query.sort)) {
                throw new Error('Only one "sort" parameter is allowed');
            }
            return true;
        })
        .isInt({ min: -1, max: 1 }).withMessage('Sort must be -1 (desc) or 1 (asc)')
        .toInt()
        .custom((value) => {
            if (![1, -1].includes(value)) {
                throw new Error('Sort must be -1 (desc) or 1 (asc)');
            }
            return true;
        }),

    query('title')
        .optional()
        .custom((value, { req }) => {
            if (Array.isArray(req.query.title)) {
                throw new Error('Only one "title" parameter is allowed');
            }
            return true;
        })
        .isString().withMessage('Title must be a string')
        .trim()
        .notEmpty().withMessage('Title cannot be empty'),

    query()
        .custom((value, { req }) => {
            const allowedParams = ['page', 'sort', 'title'];  
            const invalidParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));

            if (invalidParams.length > 0) {
                throw new Error(`Invalid query parameters`);
            }
            return true;
        })
];


const validateJobId = () => param('jobId')
    .exists().withMessage('job id is required')
    .isInt({ min: 1 }).withMessage('job id must be an integer greater than 0')
    .toInt();

const validateSeekerId = () => param('jobId')
    .exists().withMessage('seeker id is required')
    .isInt({ min: 1 }).withMessage('seeker id must be an integer greater than 0')
    .toInt();

const validateDate = () => body('timestamp')
    .notEmpty().withMessage('Timestamp is required')
    .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp');
        }
        return true;
    })

module.exports = {
    interviewQueryParametersValidation,
    validateJobId,
    validateSeekerId,
    validateDate
}