const { query, body, param } = require('express-validator');
const { validatePage, validateIndustry, validateCountry, validateCity, validateRemote } = require('../../../common/util');

const validateCompanyRating = () => query('companyRating')
    .optional()
    .isString()
    .withMessage('companyRating parameter must be a string')
    .trim()
    .isInt({ allow_leading_zeroes: false, min: 1, max: 5 })
    .withMessage("Invalid companyRating parameter, it must be between 1 and 4")
    .toInt();

const validateFromDate = () => query('fromDate')
    .optional()
    .isString()
    .withMessage('fromDate parameter must be a string')
    .trim()
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .custom((value, { req: { query } }) => query.toDate !== undefined)
    .withMessage('toDate parameter must be passed with fromDate parameter')
    .customSanitizer(isoString => new Date(isoString));

const validateToDate = () => query('toDate')
    .optional()
    .isString()
    .withMessage('toDate parameter must be a string')
    .trim()
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .custom((value, { req: { query } }) => query.fromDate !== undefined)
    .withMessage('fromDate parameter must be passed with toDate parameter')
    .customSanitizer(isoString => new Date(isoString));

const validateWord = () => query('word')
    .isString()
    .withMessage('word parameter must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('word parameter length must be between 1 and 50');

const validateCVId = () => body('cvId', 'Invalid CV id')
    .custom(value => typeof value === 'number' && value > 0)
    .isInt();

const validateJobId = () => body('jobId', 'Invalid job id')
    .custom(value => typeof value === 'number' && value > 0)
    .isInt();

const validateJobIdParam = () => param('jobId', 'Invalid job id')
    .isString()
    .isInt({ min: 1 })
    .toInt();

exports.validateGetRecommendedJobs =
    [
        validatePage(),
        validateFromDate(),
        validateToDate(),
        validateCompanyRating(),
        validateIndustry(),
        validateRemote(),
        validateCountry(),
        validateCity()
    ];

exports.validateGetSearchedJobs = [...exports.validateGetRecommendedJobs, validateWord()];

exports.validateApplyToJob = [validateCVId(), validateJobId()];

exports.validateJobIdParam = validateJobIdParam();