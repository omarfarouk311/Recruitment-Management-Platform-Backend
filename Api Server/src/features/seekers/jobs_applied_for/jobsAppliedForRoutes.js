const { Router } = require('express');
const jobsAppliedForController = require('./jobsAppliedForController');
const jobsAppliedForAuthorization = require('./jobsAppliedForAuthorization');
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

module.exports = router;