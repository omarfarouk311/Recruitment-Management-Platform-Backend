const { Router } = require('express');
const companyController = require('./companyController');
const companyValidation = require('./companyValidation');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/:companyId')
    .get(companyValidation.validateGetCompanyData, handleValidationErrors, companyController.getCompanyData)
    .all(notAllowed);

module.exports = router;