const { Router } = require('express');
const { notAllowed } = require('../../../common/errorMiddleware');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const { checkLimit } = require('./cvMiddlewares');
const cvController = require('./cvController')
const router = Router();

router.route('/')
    .post(authorizeAccess, checkLimit, cvController.uploadCV)
    .all(notAllowed);

module.exports = router;