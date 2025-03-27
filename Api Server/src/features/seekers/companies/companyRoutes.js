const express = require('express');
const companyController = require('./companyController');
const companyValidation = require('./companyValidation');
const companyAuthorization = require('./companyAuthorization');
const { handleValidationErrors } = require('../../../common/util');

const router = express.Router();

router.get('/filter', companyAuthorization.isSeeker, companyController.getCompaniesFilter);

router.get('/', companyValidation.CompanyQuery, handleValidationErrors, companyController.getCompanies);

module.exports = router;