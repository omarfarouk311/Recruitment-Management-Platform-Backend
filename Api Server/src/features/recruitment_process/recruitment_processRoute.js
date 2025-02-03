const express = require('express');
const router = express.Router();
const recruitment_processController = require('./recruitment_processController');
const { handleValidationErrors, validateRecruitmentProcessData,
        validateCompanyId, validateRecruitmentProcessId } = require('./recruitment_processValidation');
const { authorizeRecruitmentProcess } = require('./recruitment_processAuthorization');

// Todo: Add authentication middleware 
router.route('/recruitment_process')
        .get(recruitment_processController.getRecruitmentProcess)
        .post(validateRecruitmentProcessData, handleValidationErrors, recruitment_processController.CreateRecruitmentProcess);

router.route('/recruitment_process/:processId')
        .get(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.getRecruitmentProcessById)
        .put(validateRecruitmentProcessId, validateRecruitmentProcessData, handleValidationErrors,
                authorizeRecruitmentProcess, recruitment_processController.updateRecruitmentProcess)
        .delete(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.deleteRecruitmentProcess);


