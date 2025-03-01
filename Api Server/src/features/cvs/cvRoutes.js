const { Router } = require('express');
const { notAllowed } = require('../../common/errorMiddleware');
const { authorizeAccess } = require('../seekers/jobs_applied_for/jobsAppliedForAuthorization');
const { parseCV } = require('./cvController');
const router = Router();

router.route('/')
    .post(authorizeAccess, parseCV)
    .all(notAllowed);

module.exports = router;