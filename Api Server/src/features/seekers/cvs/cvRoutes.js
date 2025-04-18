const { Router } = require('express');
const { notAllowed } = require('../../../common/errorMiddleware');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const { checkLimit } = require('./cvAuthorization');
const cvController = require('./cvController')
const { cvIdValidation, jobIdValidation, seekerIdValidation } = require('./cvValidation');
const { handleValidationErrors, validateFileNameHeader } = require('../../../common/util')
const router = Router();

router.route('/')
    .post(authorizeAccess, checkLimit, validateFileNameHeader(), handleValidationErrors, cvController.uploadCV)
    .get(jobIdValidation(), seekerIdValidation(), handleValidationErrors, cvController.getCvName)
    .all(notAllowed);

router.route('/:cvId')
    .get(cvIdValidation(), jobIdValidation(), seekerIdValidation(), handleValidationErrors, cvController.downloadCV)
    .delete(authorizeAccess, cvIdValidation(), handleValidationErrors, cvController.deleteCV)
    .all(notAllowed);


router.route('/job/:jobId')
    .get(authorizeAccess, jobIdValidation(), handleValidationErrors, cvController.getCvsForJob)
    .all(notAllowed);


module.exports = router;