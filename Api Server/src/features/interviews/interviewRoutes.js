const express = require('express');
const router = express.Router();
const { recruiterAndCompanyInterviewsAuth, dateInterviewModificationAuth } = require('./interviewAuthentication');
const { interviewQueryParametersValidation, validateJobId, validateSeekerId, validateDate } = require('./interviewValidation');
const { handleValidationErrors, validatePage } = require('../../common/util');
const { getRecruiterInterviewsData, modifyInterviewDate } = require('./interviewController')


router.get('/', interviewQueryParametersValidation, validatePage(), handleValidationErrors, recruiterAndCompanyInterviewsAuth, getRecruiterInterviewsData)

// modify date
router.put('/:jobId/:seekerId', validateJobId(), validateSeekerId(), validateDate(), handleValidationErrors, dateInterviewModificationAuth, modifyInterviewDate)

module.exports = router;