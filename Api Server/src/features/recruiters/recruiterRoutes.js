
const express = require('express');
const router=express();
const {handleValidationErrors}=require('../../common/util')

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter,authorizeInvitationData,authorizeRecruiter,authorizeCompany}=require('./recruiterAuthorization')
const {validateParams,validateRecruiterId,validateInvitationData,validateJobOffer}=require('./recruiterValidation')


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
        

router.route('/invitation')
        .post(validateInvitationData,
              handleValidationErrors,
              authorizeCompany,
              authorizeInvitationData,
              recruiterController.sendInvitationController)

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

router.route('/profile-pic')
        .get(authorizeRecruiter
            ,recruiterController.getProfilePicController)

module.exports=router