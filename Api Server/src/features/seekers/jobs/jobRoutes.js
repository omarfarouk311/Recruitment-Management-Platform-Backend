const { Router } = require('express');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const jobValidation = require('./jobValidation');
const jobController = require('./jobController');
const { notAllowed } = require('../../../common/errorMiddleware');
const { handleValidationErrors } = require('../../../common/util');
const router = Router();

router.route('/recommended')
    .get(
        authorizeAccess,
        jobValidation.validateGetRecommendedJobs,
        handleValidationErrors,
        jobController.getRecommendedJobs
    )
    .all(notAllowed);

router.route('/recommended/:jobId')
    .delete(
        authorizeAccess,
        jobValidation.validateJobIdParam,
        handleValidationErrors,
        jobController.removeRecommendation
    )
    .all(notAllowed);

router.route('/')
    .get(
        authorizeAccess,
        jobValidation.validateGetSearchedJobs,
        handleValidationErrors,
        jobController.getSearchedJobs
    )
    .all(notAllowed);

router.route('/apply')
    .post(
        authorizeAccess,
        jobValidation.validateApplyToJob,
        handleValidationErrors,
        jobController.applyToJob
    )
    .all(notAllowed);

module.exports = router;