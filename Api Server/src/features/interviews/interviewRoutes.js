const express = require('express');
const router = express.Router();
const { recruiterAndCompanyInterviewsAuth, dateInterviewModificationAuth } = require('./interviewAuthentication');
const { interviewQueryParametersValidation, validateJobId, validateSeekerId, validateDate } = require('./interviewValidation');
const { handleValidationErrors, validatePage, validateCity, validateCountry, validateCompanyName } = require('../../common/util');
const { getRecruiterInterviewsData, modifyInterviewDate, getSeekerInterviewsData } = require('./interviewController')
const { notAllowed } = require('../../common/errorMiddleware');


router.route('/')
    .get(interviewQueryParametersValidation, validatePage(), validateCity(), validateCountry(), handleValidationErrors, recruiterAndCompanyInterviewsAuth, getRecruiterInterviewsData)
    .all(notAllowed)


router.route('/seeker')
    .get(interviewQueryParametersValidation, validatePage(), validateCity(), validateCountry(), validateCompanyName(), handleValidationErrors, getSeekerInterviewsData)

// modify date
router.route('/:jobId/:seekerId')
    .put(validateJobId(), validateSeekerId(), validateDate(), handleValidationErrors, dateInterviewModificationAuth, modifyInterviewDate)
    .all(notAllowed)


module.exports = router;