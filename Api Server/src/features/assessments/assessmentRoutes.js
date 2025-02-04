const express = require('express');
const router= express.Router();
const assessmentController = require('./assessmentController');
const {assessmentBodyValidation}=require('./assessmentsValidation');
const{authorizeCompany}=require('./assessmentAuthorization');



router.route('/')
       .post(assessmentBodyValidation,assessmentController.add_AssessmentController) // verify token of company later
       .get(assessmentController.get_All_AssessmentController)  // verify token of company later

router.route('/:id')
        .get(authorizeCompany,assessmentController.get_AssessmentByIdController) // get assessment by id   // erify token of company later
        .put(assessmentBodyValidation,authorizeCompany,assessmentController.edit_AssessmentByIdController)// edit assessment by id   // verify token of company later
        .delete(authorizeCompany,assessmentController.delete_AssessmentByIdController)// delete assessment by id   //verify token of company later

router.route('/:id/job/:jobId')
        .post(assessmentController.compute_JobSeekerScore) // calculate score of jobseeker in the assessment  //verify token of jobseeker later
        
router.route('/job/:jobId/jobSeeker/:jobSeekerId')
        .get(assessmentController.get_JobSeekerScore) // get score of jobseeker in the assessment  //verify token of jobseeker later





      



module.exports = router;