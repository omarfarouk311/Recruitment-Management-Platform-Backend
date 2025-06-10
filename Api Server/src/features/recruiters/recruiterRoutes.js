
const express = require('express');
const router=express();
const {handleValidationErrors}=require('../../common/util')

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter,authorizeRecruiter,authorizeCompany}=require('./recruiterAuthorization')
const {validateParams,validateRecruiterId,validateInvitationData,validateJobOffer,validateRecruiterName}=require('./recruiterValidation')


router.route('/')   //localhost:3000/recruiters/?recruiter="" & department="" & sorted=""&page=""
        .get(validateParams,
            handleValidationErrors,
            authorizeCompany,
            recruiterController.getRecruitersContoller)

router.route('/:recruiterId')  
        .delete(validateRecruiterId,
                handleValidationErrors,
                authorizeCompany,
                authorizeCompanyRecruiter,
                recruiterController.deleteRecruiterController)

router.route('/departments')
        .get(authorizeCompany,
             recruiterController.getUniquetDepartmentsController)


router.route('/job-offer-sent')
        .get(validateJobOffer,
            handleValidationErrors,
            authorizeRecruiter,
            recruiterController.getJobOfferSentController)

router.route('/assigned-Candidate-JobTitles')  // get list of the jobs the recruiter see  because of the candidate he assigned to  
        .get(authorizeRecruiter,
             recruiterController.getJobTitleList)

router.route('/profile-data')
        .get(authorizeRecruiter,
             recruiterController.getRecruiterDataController)

router.route('/:userId/profile-pic')
        .get(authorizeRecruiter
            ,recruiterController.getProfilePicController)

router.route('/profile-pic')
        .put(authorizeRecruiter,
                recruiterController.updateProfilePicController)



router.route('/allRecruiters')
        .get(authorizeCompany,
            recruiterController.getAllRecruitersController)


router.route('/recruiter')
        .put(authorizeRecruiter,
             validateRecruiterName,
             handleValidationErrors,
            recruiterController.updateRecruiterController)


router.route('/finish-profile')
        .post(validateRecruiterName,
            recruiterController.finishProfileController)
module.exports=router