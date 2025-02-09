const { Router } = require('express');
const invitationController = require('./invitationController');
const invitationValidation = require('./invitationValidation');
const { authorizeGetInvitations } = require('./invitationAuthorization')
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/')
    .get(
        authorizeGetInvitations,
        invitationValidation.validateGetInvitations,
        handleValidationErrors,
        invitationController.getInvitations
    )
    .all(notAllowed);

module.exports = router;
