const express = require('express');
const router = express.Router();
const recruitment_processController = require('./recruitment_processController');
const { validateRecruitmentProcessData,
        validateCompanyId, validateRecruitmentProcessId, validatePagination } = require('./recruitment_processValidation');
const { authorizeRecruitmentProcess } = require('./recruitment_processAuthorization');
const { notAllowed } = require('../../common/errorMiddleware');
const { handleValidationErrors } = require('../../common/util');

// Todo: Add authentication middleware 
router.route('/recruitment_process')
        .get(validatePagination, recruitment_processController.getRecruitmentProcess)
        .post(validateRecruitmentProcessData, handleValidationErrors, recruitment_processController.CreateRecruitmentProcess)
        .all(notAllowed);

router.route('/recruitment_process/:processId')
        .get(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.getRecruitmentProcessById)
        .put(validateRecruitmentProcessId, validateRecruitmentProcessData, handleValidationErrors,
                authorizeRecruitmentProcess, recruitment_processController.updateRecruitmentProcess)
        .delete(validateRecruitmentProcessId, handleValidationErrors, authorizeRecruitmentProcess,
                recruitment_processController.deleteRecruitmentProcess)
        .all(notAllowed);


module.exports = router;