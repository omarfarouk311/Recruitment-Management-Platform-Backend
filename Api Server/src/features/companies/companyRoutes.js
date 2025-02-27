const { Router } = require('express');
const companyController = require('./companyController');
const companyValidation = require('./companyValidation');
const { authorizeUpdateCompanyData } = require('./companyAuthorization')
const { handleValidationErrors, multipartParser } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/profile')
    .put(authorizeUpdateCompanyData,
        multipartParser('image'),
        companyValidation.validateUpdateCompanyData,
        handleValidationErrors,
        companyController.updateCompanyData
    )
    .all(notAllowed);

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

router.route('/:companyId/photo')
    .get(companyController.getCompanyPhoto)
    .all(notAllowed);

module.exports = router;