const express = require('express');
const router = express.Router();
const recruitment_processController = require('./recruitment_processController');
const { validateRecruitmentProcessData,
        validateCompanyId, validateRecruitmentProcessId, paginationValidation } = require('./recruitment_processValidation');
const { RecruitmenProcessesAuthorization, RecruitmenProcessDetailsAuthorization } = require('./recruitment_processAuthorization');
const { notAllowed } = require('../../common/errorMiddleware');
const { handleValidationErrors } = require('../../common/util');

// Todo: Add authentication middleware

router.get('/phases', RecruitmenProcessesAuthorization, recruitment_processController.getPhases);

router.route('/')
        .get(paginationValidation, handleValidationErrors, RecruitmenProcessesAuthorization, recruitment_processController.getRecruitmentProcess)
        .post(validateRecruitmentProcessData, handleValidationErrors, RecruitmenProcessesAuthorization, recruitment_processController.CreateRecruitmentProcess)
        .all(notAllowed);

router.route('/:processId')
        .get(validateRecruitmentProcessId, handleValidationErrors, RecruitmenProcessDetailsAuthorization,
                recruitment_processController.getRecruitmentProcessDetails)
        .put(validateRecruitmentProcessId, validateRecruitmentProcessData, handleValidationErrors,
                RecruitmenProcessDetailsAuthorization, recruitment_processController.updateRecruitmentProcess)
        .delete(validateRecruitmentProcessId, handleValidationErrors, RecruitmenProcessDetailsAuthorization,
                recruitment_processController.deleteRecruitmentProcess)
        .all(notAllowed);



module.exports = router;