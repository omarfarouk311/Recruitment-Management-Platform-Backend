const { query, body, param } = require('express-validator');
const { validatePage, validateIndustry, validateRemote } = require('../../common/util');
const config = require('../../../config/config');

const validateCompanyId = () => param('companyId', 'Invalid company ID')
    .isString()
    .notEmpty()
    .withMessage("Company ID must be passed as a route patameter")
    .isInt({ min: 1, allow_leading_zeroes: false })
    .toInt();

const validateFilterBar = () => query('filterBar')
    .optional()
    .isString()
    .withMessage('filterBar parameter must be a string')
    .trim()
    .custom(value => value === 'true')
    .withMessage('filterBar parameter allowed value is true')
    .customSanitizer(value => Boolean(value));

const validateSortByDate = () => query('sortByDate')
    .optional()
    .isString()
    .withMessage('sortByDate parameter must be a string')
    .trim()
    .custom(value => value === '1' || value === '-1')
    .withMessage('sortByDate parameter value must be 1 or -1');

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

const validateFoundedIn = () => body('foundedIn', `foundedIn must be an integer between ${config.minYear} and ${new Date().getFullYear()}`)
    .custom(value => typeof value === 'number' && value >= config.minYear && value <= new Date().getFullYear())
    .isInt();

const validateSize = () => body('size', `size must be an integer between ${config.minCompanySize} and ${config.maxCompanySize}`)
    .custom(value => typeof value === 'number' && value >= config.minCompanySize && value <= config.maxCompanySize)
    .isInt();

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

const validateReviewRating = () => query('rating', "Invalid rating option, it must be a number between 1 and 5")
    .optional()
    .isString()
    .trim()
    .isInt({ allow_leading_zeroes: false, min: 1, max: 5 })
    .toInt();

const validateSortByRating = () => query('sortByRating')
    .optional()
    .isString()
    .trim()
    .custom((value, { req }) => req.query.sortByDate === undefined)
    .withMessage("Sort is only allowed by one option at a time")
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1)
    .withMessage('sortByRating parameter value must be 1 or -1');

exports.validateCompanyId = validateCompanyId();

exports.validateGetCompanyJobs = [
    validateCompanyId(),
    validatePage(),
    validateFilterBar(),
    validateIndustry(),
    validateSortByDate(),
    validateRemote()
];

exports.validateUpdateCompanyData = [
    validateOverview(),
    validateName(),
    validateType(),
    validateSize(),
    validateFoundedIn(),
    validateIndustries(),
    validateLocations(),
    validateIndustriesArray(),
    validateLocationsArray()
];

exports.validateGetCompanyReviews = [
    validateCompanyId(),
    validatePage(),
    validateReviewRating(),
    validateSortByDate(),
    validateSortByRating()
];