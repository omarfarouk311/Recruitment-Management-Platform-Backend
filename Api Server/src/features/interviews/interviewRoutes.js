const express = require('express');
const router = express.Router();
const { recruiterAndCompanyInterviewsAuth, dateInterviewModificationAuth } = require('./interviewAuthentication');
const { interviewQueryParametersValidation, validateJobId, validateSeekerId, validateDate } = require('./interviewValidation');
const { handleValidationErrors, validatePage } = require('../../common/util');
const { getRecruiterInterviewsData, modifyInterviewDate } = require('./interviewController')
const { notAllowed } = require('../../common/errorMiddleware');


router.route('/')
    .get(interviewQueryParametersValidation, validatePage(), handleValidationErrors, recruiterAndCompanyInterviewsAuth, getRecruiterInterviewsData)
    .all(notAllowed)

// modify date
router.route('/:jobId/:seekerId')
    .put(validateJobId(), validateSeekerId(), validateDate(), handleValidationErrors, dateInterviewModificationAuth, modifyInterviewDate)
    .all(notAllowed)


module.exports = router;