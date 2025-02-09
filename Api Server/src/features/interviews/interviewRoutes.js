const express = require('express');
const router = express.Router();
const { getRecruiterAndCompanInterviewsAuth } = require('./interviewAuthentication');
const { interviewQueryParametersValidation } = require('./interviewValidation');
const { handleValidationErrors, validatePage } = require('../../common/util');
const { getRecruiterInterviewsData } = require('./interviewController')


router.get('/',interviewQueryParametersValidation, validatePage(), handleValidationErrors, getRecruiterAndCompanInterviewsAuth, getRecruiterInterviewsData)


module.exports = router;