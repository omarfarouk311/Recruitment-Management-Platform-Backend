const { Router } = require('express');
const jobsAppliedForController = require('./jobsAppliedForController');
const jobsAppliedForAuthorization = require('./jobsAppliedForAuthorization');
const jobsAppliedForValidation = require('./jobsAppliedForValidation')
const { handleValidationErrors } = require('../../../common/util');
const { notAllowed } = require('../../../common/errorMiddleware');
const router = Router();

router.route('/companies-filter')
    .get(
        jobsAppliedForAuthorization.authorizeAccess,
        jobsAppliedForController.getCompaniesFilter
    )
    .all(notAllowed);

router.route('/locations-filter')
    .get(
        jobsAppliedForAuthorization.authorizeAccess,
        jobsAppliedForController.getLocationsFilter
    )
    .all(notAllowed);

router.route('/')
    .get(
        jobsAppliedForAuthorization.authorizeAccess,
        jobsAppliedForValidation.validateGetJobsAppliedFor,
        handleValidationErrors,
        jobsAppliedForController.getJobsAppliedFor
    )
    .all(notAllowed);

module.exports = router;