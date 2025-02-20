const { query } = require('express-validator');
const { validatePage} = require('../../../common/util')

const CompanyName = () =>
  query('companyName')
    .optional()
    .isAlpha()
    .withMessage('Company name must be alphabetic ');

const CompanyType = () =>
  query('companyType')
    .optional()
    .isIn([true, false])
    .isBoolean()
    .withMessage('Company type is required');

const CompanyMinSize = () =>
  query('companyMinSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company minimum size must be a positive integer');

const CompanyMaxSize = () =>
    query('companyMaxSize')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Company maximum size must be a positive integer')
      .custom((value, req) => {
          if (value < req.query.companyMinSize) {
              throw new Error('Company maximum size must be greater than minimum size');
          }
          return true;
      });

const CompanyIndustry = () =>
  query('companyIndustry')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Company industry must be positive integer');

const CompanyCity = () =>
  query('companyCity')
    .optional()
    .isString()
    .isAlpha()
    .withMessage('Company city must be an string');

const CompanyCountry = () =>
  query('companyCountry')
    .optional()
    .isString()
    .isAlpha()
    .withMessage('Company country must be an string');

const CompanyRating = () =>
  query('companyRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Company rating must be a number between 0 and 5');

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
