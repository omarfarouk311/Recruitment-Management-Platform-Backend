const { role: { recruiter, company } } = require('../../../config/config');

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