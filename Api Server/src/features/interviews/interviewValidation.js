const { query } = require('express-validator');


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

module.exports = {
    interviewQueryParametersValidation
}