const { query } = require('express-validator');
const { validateLocation, validateRemote } = require('../jobs_applied_for/jobsAppliedForValidation')
const { validateIndustry } = require('../../companies/companyValidation');
const { validatePage } = require('../../../common/util');

const validateCompanyRating = () => query('companyRating')
    .optional()
    .isString()
    .withMessage('companyRating parameter must be a string')
    .trim()
    .isInt({ allow_leading_zeroes: false, min: 1, max: 4 })
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
    .custom(value => value !== undefined)
    .withMessage('word parameter must exist')
    .isString()
    .withMessage('word parameter must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('word parameter length must be between 1 and 50');

exports.validateGetRecommendedJobs =
    [
        validatePage(),
        validateFromDate(),
        validateToDate(),
        validateCompanyRating(),
        validateIndustry,
        validateRemote,
        validateLocation
    ];

exports.validateGetSearchedJobs = [...exports.validateGetRecommendedJobs, validateWord()];