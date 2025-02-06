
const express = require('express');
const router=express();
const {handleValidationErrors}=require('../../common/util')

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter,authorizeInvitationData}=require('./recruiterAuthorization')
const {validateParams,validateRecruiterId,validateInvitationData}=require('./recruiterValidation')


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

module.exports=router