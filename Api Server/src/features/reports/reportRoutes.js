const { Router } = require('express');
const reportController = require('./reportController');
const reportValidation = require('./reportValidation');
const reportAuthorization = require('./reportAuthorization')
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/')
    .post(
        reportAuthorization.authorizeReportCreation,
        reportValidation.validateCreateReport,
        handleValidationErrors,
        reportController.createReport
    )
    .get(
        reportAuthorization.authorizeReportCreation,
        reportValidation.validateGetReports,
        handleValidationErrors,
        reportController.getReports
    )
    .all(notAllowed);

module.exports = router;
