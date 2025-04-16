const { Router } = require('express');
const { handleValidationErrors, validatePage } = require('../../../common/util');
const { notAllowed } = require('../../../common/errorMiddleware');
const { getSeekerReviews } = require('./reviewController');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const router = Router();

router.route('/')
    .get(
        authorizeAccess,
        validatePage(),
        handleValidationErrors,
        getSeekerReviews
    )
    .all(notAllowed);

module.exports = router;