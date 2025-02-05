
const express = require('express');
const router=express();
const {handleValidationErrors}=require('../../common/util')

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter}=require('./recruiterAuthorization')
const {validateParams,validateRecruiterId}=require('./recruiterValidation')


router.route('/')   //localhost:3000/recruiters/?recruiter="" & department="" & sorted=""&page=""
        .get(validateParams,
            handleValidationErrors,
            recruiterController.getRecruitersContoller)
        .post(recruiterController.sendInvitationController)

router.route('/:recruiterId')  
        .delete(validateRecruiterId,
                handleValidationErrors,
                authorizeCompanyRecruiter,
                recruiterController.deleteRecruiterController)
        

router.route('/invitation')
        .post(recruiterController.sendInvitationController)



module.exports=router