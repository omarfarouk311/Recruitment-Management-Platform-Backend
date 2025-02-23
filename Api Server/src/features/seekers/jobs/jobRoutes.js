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

module.exports = router;