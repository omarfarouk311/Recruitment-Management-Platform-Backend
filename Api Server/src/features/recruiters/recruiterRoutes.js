
const express = require('express');
const router=express();

const recruiterController=require('./recruiterController');
const {authorizeCompanyRecruiter}=require('./recruiterAuthorization')



router.route('/:companyId')  //companyId will be taken from token later and route will be /  //localhost:3000/recruiters/companyId?recruiter="" & department="" & sorted=""&page=""
        .get(recruiterController.getRecruitersContoller)

router.route('/:recruiterId/company/:companyId')  // companyId will be taken from token later and route will be /:recruiterId
        .delete(authorizeCompanyRecruiter,recruiterController.deleteRecruiterController)
        





module.exports=router