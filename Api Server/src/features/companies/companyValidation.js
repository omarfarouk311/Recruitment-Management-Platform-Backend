const { buildCheckFunction, query, body, param } = require('express-validator');
const { validatePage } = require('../../common/util');
const config = require('../../../config/config');

const validateCompanyId = () => param('companyId')
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
    .isLength({ min: config.minIndustryLength, max: config.maxIndustryLength })
    .withMessage(`industry parameter length must be between ${config.minIndustryLength} and ${config.maxIndustryLength}`);

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

const validateOverview = () => body('overview')
    .isString()
    .withMessage('overview must be a string')
    .trim()
    .isLength({ min: config.minOverviewLength, max: config.maxOverviewLength })
    .withMessage(`overview length must be between ${config.minOverviewLength} and ${config.maxOverviewLength}`);

const validateName = () => body('name')
    .isString()
    .withMessage('name must be a string')
    .trim()
    .isLength({ min: config.minNameLength, max: config.maxNameLength })
    .withMessage(`name length must be between ${config.minNameLength} and ${config.maxNameLength}`);

const validateType = () => body('type')
    .custom(value => typeof value === 'boolean')
    .withMessage('type must be true or flase')

const validateFoundedIn = () => body('foundedIn')
    .custom(value => typeof value === 'number' && value >= config.minYear && value <= new Date().getFullYear())
    .withMessage(`foundedIn must be a number between ${config.minYear} and ${new Date().getFullYear()}`)

const validateSize = () => body('size')
    .custom(value => typeof value === 'number' && value >= config.minCompanySize && value <= config.maxCompanySize)
    .withMessage(`size must be a number between ${config.minCompanySize} and ${config.maxCompanySize}`)

const validateIndustries = () => body('industries')
    .isArray({ min: config.minIndustriesArrayLength, max: config.maxIndustriesArrayLength })
    .withMessage(`industries must be an array with size between ${config.minIndustriesArrayLength} and ${config.maxIndustriesArrayLength}`);

const validateLocations = () => body('locations')
    .isArray({ min: config.minLocationsArrayLength, max: config.maxLocationsArrayLength })
    .withMessage(`locations must be an array with size between ${config.minLocationsArrayLength} and ${config.maxLocationsArrayLength}`);

const validateIndustriesArray = () => body('industries.*')
    .isString()
    .withMessage('industry must be a string')
    .trim()
    .isLength({ min: config.minIndustryLength, max: config.maxIndustryLength })
    .withMessage(`industry length must be between ${config.minIndustryLength} and ${config.maxIndustryLength}`);

const validateLocationsArray = () => body('locations.*')
    .custom(({ country, city }) => {
        if (!(typeof country === 'string' && typeof city === 'string')) {
            throw new Error('city and country must be a string');
        }
        if (country.length < config.minLocationLength || country.length > config.maxLocationLength
            || city.length < config.minLocationLength || city.length > config.maxLocationLength) {
            throw new Error(`city and country length must be between ${config.minLocationLength} and ${config.maxLocationLength}`);
        }
        return true;
    });

exports.validateCompanyId = validateCompanyId();

exports.validateGetCompanyJobs = [validateCompanyId(), validatePage(), validateFilterBar(), validateSimplified(),
validateIndustry(), validateSortByDate(), validateRemote()];

exports.validateUpdateCompanyData = [validateOverview(), validateName(), validateType(), validateSize(),
validateFoundedIn(), validateIndustries(), validateLocations(), validateIndustriesArray(), validateLocationsArray()];
