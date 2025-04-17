const { role: { recruiter, company } } = require('../../../config/config');
const Invitation = require('./invitationModel');

exports.authorizeGetInvitations = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== recruiter && userRole !== company) {
        const err = new Error('Unauthorized acess on invitations');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};

exports.authorizecreateInvitation = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== company) {
        const err = new Error('Unauthorized acess on creating invitation');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};

exports.authorizeReplyToInvitation = async (req, res, next) => {
    const { userRole } = req;

    if (userRole !== recruiter) {
        const err = new Error('Unauthorized acess on replying to an invitation');
        err.status = 403;
        err.msg = 'Unauthorized request';
        return next(err);
    }

    try {
        const { userId: recruiterId, params: { invitationId } } = req;
        const invitations = await Invitation.getInvitationReceiver(invitationId);

        if (!invitations.length) {
            const err = new Error('Invitation not found');
            err.msg = err.message;
            err.status = 404;
            throw err;
        }

        const { recruiterId: invitationReceiverId } = invitations[0];
        if (invitationReceiverId !== recruiterId) {
            const err = new Error('Unauthorized access on replying to an invitation');
            err.msg = 'Unauthorized request';
            err.status = 403;
            throw err;
        }

        next();
    }
    catch (err) {
        return next(err);
    }
};
