const { Router } = require('express');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const { getStats } = require('./statsController');
const { notAllowed } = require('../../../common/errorMiddleware');
const router = Router();

router.route('/')
    .get(authorizeAccess, getStats)
    .all(notAllowed);

module.exports = router;