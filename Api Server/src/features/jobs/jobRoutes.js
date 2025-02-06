const express = require('express');
const router = express.Router();
const jobValidation = require('./jobValidation')
const jobController = require('./jobController')
const { handleValidationErrors } = require('../../common/util')
const { jobOfCompanyAuthorization, deleteUpdateJobAuthorization } = require('./jobAuthorization')

//Todo: Add Authentication Middleware

// jobs possess by company
router.route('/company')
        .get(jobValidation.jobsQueryValidate, handleValidationErrors, jobOfCompanyAuthorization, jobController.getAllCompanyJobs)

router.post('/', jobValidation.newJobValidation, handleValidationErrors, jobOfCompanyAuthorization, jobController.createJob)
        

router.route('/:id')
        .get(jobValidation.jobIdValidation, handleValidationErrors, jobController.getJobDetailsById)
        .delete(jobValidation.jobIdValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.deleteJobById)
        .put(jobValidation.jobIdValidation, jobValidation.newJobValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.updateJobById)




module.exports = router;