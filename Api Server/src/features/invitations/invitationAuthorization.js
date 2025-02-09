const { role: { recruiter } } = require('../../../config/config');

exports.authorizeGetInvitations = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== recruiter) {
        const err = new Error('Unauthorized acess on recruiter invitations');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};