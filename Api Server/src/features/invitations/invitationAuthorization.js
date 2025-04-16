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

    const { userId: recruiterId, params: { invitationId } } = req;
    try {
        await Invitation.authorizeReplyToInvitation(invitationId, recruiterId);
        next();
    }
    catch (err) {
        return next(err);
    }
};
