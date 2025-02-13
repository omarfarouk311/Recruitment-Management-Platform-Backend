const express = require('express');
const router= express.Router();
const assessmentController = require('./assessmentController');
const {assessmentBodyValidation,assessmentParamsValidation,jobParamsValidation,seekerParamsValidation}=require('./assessmentsValidation');
const{authorizeCompanyAssessment,authorizeCompanyJob,authorizeCompany}=require('./assessmentAuthorization');
const {handleValidationErrors}=require('../../common/util')



router.route('/')
       .post(assessmentBodyValidation,handleValidationErrors,authorizeCompany,assessmentController.add_AssessmentController) // verify token of company later
       .get(authorizeCompany,assessmentController.get_All_AssessmentController)  // verify token of company later

router.route('/:id')
        .get(handleValidationErrors,authorizeCompanyAssessment,assessmentController.get_AssessmentByIdController) // get assessment by id   // erify token of company later
        .put(assessmentParamsValidation,handleValidationErrors,assessmentBodyValidation,authorizeCompanyAssessment,assessmentController.edit_AssessmentByIdController)// edit assessment by id   // verify token of company later
        .delete(handleValidationErrors,authorizeCompanyAssessment,assessmentController.delete_AssessmentByIdController)// delete assessment by id   //verify token of company later

router.route('/:id/job/:jobId')
        .post(assessmentParamsValidation,
                jobParamsValidation,
                handleValidationErrors,
                assessmentController.compute_JobSeekerScore) // calculate score of jobseeker in the assessment  //verify token of jobseeker later
        
router.route('/job/:jobId/jobSeeker/:jobSeekerId')
        .get(jobParamsValidation,
             seekerParamsValidation,
             handleValidationErrors,
             authorizeCompanyJob,
             assessmentController.get_JobSeekerScore) // get score of jobseeker in the assessment  //verify token of jobseeker later





      



module.exports = router;