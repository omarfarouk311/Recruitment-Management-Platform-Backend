
const express = require('express');
const router=express();
const {handleValidationErrors}=require('../../common/util')

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter,authorizeInvitationData,authorizeRecruiter}=require('./recruiterAuthorization')
const {validateParams,validateRecruiterId,validateInvitationData,validateJobOffer}=require('./recruiterValidation')


router.route('/')   //localhost:3000/recruiters/?recruiter="" & department="" & sorted=""&page=""
        .get(validateParams,
            handleValidationErrors,
            recruiterController.getRecruitersContoller)

router.route('/:recruiterId')  
        .delete(validateRecruiterId,
                handleValidationErrors,
                authorizeCompanyRecruiter,
                recruiterController.deleteRecruiterController)
        

router.route('/invitation')
        .post(validateInvitationData,
              handleValidationErrors,
              authorizeInvitationData,
              recruiterController.sendInvitationController)

router.route('/departments')
        .get(recruiterController.getUniquetDepartmentsController)


router.route('/job-offer-sent')
        .get(validateJobOffer,
            handleValidationErrors,
            authorizeRecruiter,
            recruiterController.getJobOfferSentController)

router.route('/assigned-Candidate-JobTitles')  // get list of the jobs the recruiter see  because of the candidate he assigned to  
        .get(authorizeRecruiter,
             recruiterController.getJobTitleList)

module.exports=router