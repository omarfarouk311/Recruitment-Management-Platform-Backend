const { Router } = require('express');
const invitationController = require('./invitationController');
const invitationValidation = require('./invitationValidation');
const invitationAuthorization = require('./invitationAuthorization')
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/')
    .get(
        invitationAuthorization.authorizeGetInvitations,
        invitationValidation.validateGetInvitations,
        handleValidationErrors,
        invitationController.getInvitations
    )
    .post(
        invitationAuthorization.authorizecreateInvitation,
        invitationValidation.validateCreateInvitation,
        handleValidationErrors,
        invitationController.sendInvitation
    )
    .all(notAllowed);

router.route('/:invitationId')
    .patch(
        invitationValidation.validateReplyToInvitation,
        handleValidationErrors,
        invitationAuthorization.authorizeReplyToInvitation,
        invitationController.replyToInvitation
    )
    .all(notAllowed)

module.exports = router;
