const express = require('express');
const router = express.Router();
const jobValidation = require('./jobValidation')
const jobController = require('./jobController')
const { handleValidationErrors } = require('../../common/util')
//Todo: Add Authentication Middleware

router.route('/')
        .post(jobValidation.newJobValidation, handleValidationErrors, jobController.createJob)
        .get(jobValidation.jobsQueryValidate, handleValidationErrors, jobController.getAllJobs)

router.route('/:id')
        .get(jobValidation.jobIdValidation, handleValidationErrors, jobController.getJobById)




module.exports = router;