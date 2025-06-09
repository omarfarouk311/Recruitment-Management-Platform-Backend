const { query } = require('express-validator');
const { validatePage } = require('../../../common/util')

const CompanyName = () =>
  query('companyName', "Invalid company name")
    .optional()
    .isString()

const CompanyType = () =>
  query('companyType')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Invalid company type, must be a boolean')
    .toBoolean();

const CompanyMinSize = () =>
  query('companyMinSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company minimum size must be a positive integer')
    .toInt();

const CompanyMaxSize = () =>
  query('companyMaxSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company maximum size must be a positive integer')
    .toInt()
    .custom((value, { req: { query } }) => {
      if (value < query.companyMinSize) {
        throw new Error('Company maximum size must be greater than minimum size');
      }
      return true;
    });

const CompanyIndustry = () =>
  query('companyIndustry')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company industry must be positive integer')
    .toInt();

const CompanyCity = () =>
  query('companyCity')
    .optional()
    .isString()
    .withMessage('Company city must be an string');

const CompanyCountry = () =>
  query('companyCountry')
    .optional()
    .isString()
    .withMessage('Company country must be an string');

const CompanyRating = () =>
  query('companyRating')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Company rating must be a number between 0 and 5')
    .toInt();

const CompanyQuery = [
  CompanyName(),
  CompanyType(),
  CompanyMinSize(),
  CompanyMaxSize(),
  CompanyIndustry(),
  CompanyCity(),
  CompanyCountry(),
  CompanyRating(),
  validatePage(),
];

module.exports = {
  CompanyQuery,
};
