const { buildCheckFunction, query } = require('express-validator');
const { validatePage: pageValidation, validatePage } = require('../../common/util');
const checkCompanyId = buildCheckFunction(['body', 'params']);

const validateCompanyId = () => checkCompanyId('companyId')
    .trim()
    .notEmpty()
    .withMessage("Company ID must be passed as a route patameter")
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Invalid Company ID")
    .toInt();

const validateFilterBar = () => query('filterBar')
    .optional()
    .trim()
    .custom(value => value === 'true')
    .withMessage('Invalid filterBar parameter, true is the only allowed value')
    .customSanitizer(value => Boolean(value));

const validateSimplified = () => query('simplified')
    .optional()
    .trim()
    .custom(value => value === 'true')
    .withMessage('Invalid simplified parameter, true is the only allowed value')
    .custom((value, { req: { query } }) => query.filterBar === undefined)
    .withMessage('Only one of filterBar and simplified parameters can get passed')
    .customSanitizer(value => Boolean(value));

const validateIndustry = () => query('industry')
    .optional()
    .trim()
    .isString()
    .withMessage('industry parameter must be a string')
    .isLength({ min: 1, max: 30 })
    .withMessage('industry parameter length is between 1 and 30');

const validateSortByDate = () => query('sortByDate', "Invalid sort option, it must be 1 or -1")
    .optional()
    .trim()
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1);

const validateRemote = () => query('remote')
    .optional()
    .trim()
    .custom(value => value === 'true')
    .withMessage('Invalid remote parameter, true is the only allowed value')
    .customSanitizer(value => Boolean(value));

exports.validateCompanyId = validateCompanyId();

exports.validateGetCompanyJobs = [validateCompanyId(), validatePage(), validateFilterBar(), validateSimplified(),
validateIndustry(), validateSortByDate(), validateRemote()];
