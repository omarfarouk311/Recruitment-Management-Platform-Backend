const { Router } = require('express');
const companyController = require('./companyController');
const companyValidation = require('./companyValidation');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/:companyId')
    .get(companyValidation.validateCompanyId, handleValidationErrors, companyController.getCompanyData)
    .all(notAllowed);

router.route('/:companyId/locations')
    .get(companyValidation.validateCompanyId, handleValidationErrors, companyController.getCompanyLocations)
    .all(notAllowed);

router.route('/:companyId/industries')
    .get(companyValidation.validateCompanyId, handleValidationErrors, companyController.getCompanyIndustries)
    .all(notAllowed);

router.route('/:companyId/jobs')
    .get(companyValidation.validateGetCompanyJobs, handleValidationErrors, companyController.getCompanyJobs)
    .all(notAllowed);

module.exports = router;