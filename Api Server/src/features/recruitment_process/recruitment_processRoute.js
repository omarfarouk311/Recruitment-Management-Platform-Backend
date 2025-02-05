const express = require('express');
const router = express.Router();
const recruitment_processController = require('./recruitment_processController');
const { validateRecruitmentProcessData,
        validateCompanyId, validateRecruitmentProcessId, paginationValidation } = require('./recruitment_processValidation');
const { authorizeRecruitmentProcess } = require('./recruitment_processAuthorization');
const { notAllowed } = require('../../common/errorMiddleware');
const { handleValidationErrors, validatePage } = require('../../common/util');

// Todo: Add authentication middleware

router.get('/phases', recruitment_processController.getPhases);

router.route('/')
        .get(paginationValidation, handleValidationErrors, recruitment_processController.getRecruitmentProcess)
        .post(validateRecruitmentProcessData, handleValidationErrors, recruitment_processController.CreateRecruitmentProcess)
        .all(notAllowed);

router.route('/:processId')
        .get(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.getRecruitmentProcessDetails)
        .put(validateRecruitmentProcessId, validateRecruitmentProcessData, handleValidationErrors,
                authorizeRecruitmentProcess, recruitment_processController.updateRecruitmentProcess)
        .delete(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.deleteRecruitmentProcess)
        .all(notAllowed);



module.exports = router;