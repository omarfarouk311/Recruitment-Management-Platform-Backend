const express = require('express');
const router = express.Router();
const jobValidation = require('./jobValidation')
const jobController = require('./jobController')
const { handleValidationErrors } = require('../../common/util')
const { jobOfCompanyAuthorization, deleteUpdateJobAuthorization } = require('./jobAuthorization')
const { notAllowed } = require('../../common/errorMiddleware');


//Todo: Add Authentication Middleware

// jobs possess by company
router.route('/company')
        .get(jobValidation.jobsQueryValidate, handleValidationErrors, jobOfCompanyAuthorization, jobController.getAllCompanyJobs)
        .all(notAllowed)

router.route('/')
        .post(jobValidation.newJobValidation, handleValidationErrors, jobOfCompanyAuthorization, jobController.createJob)
        .all(notAllowed)
        
router.route('/:id/edit')
        .get(jobValidation.jobIdValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.getJobDataForEditing)

router.route('/:id')
        .get(jobValidation.jobIdValidation, handleValidationErrors, jobController.getJobDetailsById)
        .patch(jobValidation.jobIdValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.closeJobById)
        .put(jobValidation.jobIdValidation, jobValidation.newJobValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.updateJobById)
        .all(notAllowed)





module.exports = router;