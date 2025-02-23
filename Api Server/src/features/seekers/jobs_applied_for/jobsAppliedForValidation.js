const { query } = require('express-validator');
const { minLocationLength, maxLocationLength, minNameLength, maxNameLength } = require('../../../../config/config');
const { validatePage } = require('../../../common/util');

const validateRemote = () => query('remote')
    .optional()
    .isString()
    .withMessage('remote parameter value must be a string')
    .custom(value => value === 'true')
    .withMessage('remote parameter allowed value is true')
    .toBoolean()

const validateCountry = () => query('country')
    .optional()
    .isString()
    .withMessage('country parameter value must be a string')
    .isLength({ min: minLocationLength, max: maxLocationLength })
    .withMessage(`country parameter length must be between ${minLocationLength} and ${maxLocationLength}`);

const validateCity = () => query('city')
    .optional()
    .isString()
    .withMessage('city parameter value must be a string')
    .isLength({ min: minLocationLength, max: maxLocationLength })
    .withMessage(`city parameter length must be between ${minLocationLength} and ${maxLocationLength}`);

const validateStatus = () => query('status')
    .optional()
    .isString()
    .withMessage('status parameter value must be a string')
    .custom(value => value === 'accepted' || value === 'rejected')
    .withMessage('status parameter allowed values are accepted and rejected')
    .customSanitizer(value => value === 'accepted');

const validateCompanyName = () => query('companyName')
    .optional()
    .isString()
    .withMessage('companyName parameter value must be a string')
    .isLength({ min: minNameLength, max: maxNameLength })
    .withMessage(`companyName parameter length must be between ${minNameLength} and ${maxLocationLength}`);

const validateSortByDate = () => query('sortByDate')
    .optional()
    .custom((value, { req: { query } }) => query.sortByStatusUpdate === undefined)
    .withMessage('only one sorting option is allowed')
    .isString()
    .withMessage('sortByDate parameter value must be a string')
    .custom(value => value === '1' || value === '-1')
    .withMessage('sortByDate parameter allowed values are 1 and -1')
    .toInt();

const validateSortByStatusUpdate = () => query('sortByStatusUpdate')
    .optional()
    .isString()
    .withMessage('sortByStatusUpdate parameter value must be a string')
    .custom(value => value === '1' || value === '-1')
    .withMessage('sortByStatusUpdate parameter allowed values are 1 and -1')
    .toInt();

exports.validateGetJobsAppliedFor = [
    validatePage(),
    validateRemote(),
    validateCountry(),
    validateCity(),
    validateStatus(),
    validateCompanyName(),
    validateSortByDate(),
    validateSortByStatusUpdate(),
];