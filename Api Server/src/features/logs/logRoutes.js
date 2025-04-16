const { Router } = require('express');
const logController = require('./logController');
const logValidation = require('./logValidation');
const { authorizeGetLogs } = require('./logAuthorization');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();


router.route('/')
    .get(authorizeGetLogs, logValidation.validateGetLogs, handleValidationErrors, logController.getLogs)
    .all(notAllowed);

router.route('/actions')
    .get(authorizeGetLogs, logController.getActions)
    .all(notAllowed);

module.exports = router;