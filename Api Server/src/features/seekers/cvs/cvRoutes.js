const { Router } = require('express');
const { notAllowed } = require('../../../common/errorMiddleware');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');
const { checkLimit } = require('./cvMiddlewares');
const cvController = require('./cvController')
const { cvIdValidation, jobIdValidation, seekerIdValidation } = require('./cvValidation');
const { handleValidationErrors } = require('../../../common/util')
const router = Router();



/* view -> seeker or (company, recruiter)
    get role 
    if seeker -> get all cvs associated to this user
    else -> I will get the cvId from candidates table (jobId and seeker Id)
    then get the cv from minio

    route will contain optional query parameters (jobId, seekerId)

*/


router.route('/')
    .post(authorizeAccess, checkLimit, cvController.uploadCV)
    .get(jobIdValidation(), seekerIdValidation(), handleValidationErrors, cvController.getCvName)
    .all(notAllowed);

router.route('/:cvId')
    .get(cvIdValidation(), jobIdValidation(), seekerIdValidation(),handleValidationErrors, cvController.downloadCV)
    .delete(authorizeAccess, cvIdValidation(), handleValidationErrors, cvController.deleteCV)
    .all(notAllowed);

module.exports = router;