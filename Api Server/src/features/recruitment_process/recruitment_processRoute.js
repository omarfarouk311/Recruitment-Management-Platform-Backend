const express = require('express');
const router = express.Router();
const recruitment_processController = require('./recruitment_processController');
const { handleValidationErrors, validateRecruitmentProcessData,
        validateCompanyId, validateRecruitmentProcessId } = require('./recruitment_processValidation');


// Todo: Add authentication, Add validation

router.route('/recruitment_process')
        .get(recruitment_processController.getRecruitmentProcess)
        .post(validateRecruitmentProcessData, handleValidationErrors, recruitment_processController.CreateRecruitmentProcess);

router.route('/recruitment_process/:processId')
        .get(validateRecruitmentProcessId, handleValidationErrors, recruitment_processController.getRecruitmentProcessById)
        .put(validateRecruitmentProcessId, validateRecruitmentProcessData, handleValidationErrors, recruitment_processController.updateRecruitmentProcess)
        .delete(validateRecruitmentProcessId, handleValidationErrors, recruitment_processController.deleteRecruitmentProcess);


