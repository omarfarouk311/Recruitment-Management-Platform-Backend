const express = require('express');
const router = express();
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const { validateFileNameHeader } = require('../../common/util');
const recruiterController = require('./recruiterController');
const { authorizeCompanyRecruiter, authorizeRecruiter, authorizeCompany } = require('./recruiterAuthorization');
const { validateParams, validateRecruiterId, validateJobOffer, validateRecruiterName } = require('./recruiterValidation');

router.route('/departments')
    .get(
        authorizeCompany,
        recruiterController.getUniquetDepartmentsController
    )
    .all(notAllowed);

router.route('/job-offer-sent')
    .get(
        validateJobOffer,
        handleValidationErrors,
        authorizeRecruiter,
        recruiterController.getJobOfferSentController
    )
    .all(notAllowed);

router.route('/assigned-Candidate-JobTitles')  // get list of the jobs the recruiter see  because of the candidate he assigned to  
    .get(
        authorizeRecruiter,
        recruiterController.getJobTitleList
    )
    .all(notAllowed);

router.route('/profile-data')
    .get(
        authorizeCompany,
        recruiterController.getRecruiterDataController
    )
    .all(notAllowed);

router.route('/profile-pic')
    .put(
        authorizeRecruiter,
        validateFileNameHeader(),
        handleValidationErrors,
        recruiterController.updateProfilePicController
    )
    .all(notAllowed);

router.route('/allRecruiters')
    .get(
        authorizeCompany,
        recruiterController.getAllRecruitersController
    )
    .all(notAllowed);

router.route('/recruiter')
    .put(
        authorizeRecruiter,
        validateRecruiterName,
        handleValidationErrors,
        recruiterController.updateRecruiterController
    )
    .all(notAllowed);

router.route('/finish-profile')
    .post(
        authorizeRecruiter,
        validateRecruiterName,
        recruiterController.finishProfileController
    )
    .all(notAllowed);

router.route('/:userId/profile-pic')
    .get(
        authorizeRecruiter,
        recruiterController.getProfilePicController
    )
    .all(notAllowed);

router.route('/:recruiterId')
    .delete(
        validateRecruiterId,
        handleValidationErrors,
        authorizeCompany,
        authorizeCompanyRecruiter,
        recruiterController.deleteRecruiterController
    )
    .all(notAllowed);

router.route('/')   //localhost:3000/recruiters/?recruiter="" & department="" & sorted=""&page=""
    .get(
        validateParams,
        handleValidationErrors,
        authorizeCompany,
        recruiterController.getRecruitersContoller
    )
    .all(notAllowed);


module.exports = router;