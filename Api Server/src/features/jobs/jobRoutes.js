const express = require('express');
const router = express.Router();
const jobValidation = require('./jobValidation')
const jobController = require('./jobController')
const { handleValidationErrors } = require('../../common/util')
const { createJobAuthorization, deleteUpdateJobAuthorization } = require('./jobAuthorization')
const { notAllowed } = require('../../common/errorMiddleware');

router.route('/')
        .post(jobValidation.newJobValidation, handleValidationErrors, createJobAuthorization, jobController.createJob)
        .all(notAllowed)

router.route('/:id/edit')
        .get(jobValidation.jobIdValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.getJobDataForEditing)
        .all(notAllowed)

router.route('/:id/similar')
        .get(jobValidation.jobIdValidation, handleValidationErrors, jobController.getSimilarJobs)
        .all(notAllowed)

router.route('/:id')
        .get(jobValidation.jobIdValidation, handleValidationErrors, jobController.getJobDetailsById)
        .patch(jobValidation.jobIdValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.closeJobById)
        .put(jobValidation.jobIdValidation, jobValidation.newJobValidation, handleValidationErrors, deleteUpdateJobAuthorization, jobController.updateJobById)
        .all(notAllowed)

module.exports = router;