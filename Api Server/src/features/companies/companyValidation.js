const { buildCheckFunction } = require('express-validator');
const checkCompanyId = buildCheckFunction(['body', 'params']);

const validateCompanyId = () => checkCompanyId('companyId')
    .trim()
    .notEmpty()
    .withMessage("Company ID must be passed as a route patameter")
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Invalid Company ID")
    .toInt();

exports.validateGetCompanyData = validateCompanyId();