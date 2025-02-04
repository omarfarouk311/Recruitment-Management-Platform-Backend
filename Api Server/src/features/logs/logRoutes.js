const { Router } = require('express');
const logController = require('./logController');
const logValidation = require('./logValidation');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();


router.route('/')
    .get(logValidation.validateGetLogs, handleValidationErrors, logController.getLogs)
    .all(notAllowed);

module.exports = router;