const { role: { jobSeeker } } = require('../../../../config/config');

exports.authorizeAccess = (req, res, next) => {
    if (req.userRole !== jobSeeker) {
        const err = new Error('Unauthorized access on job seeker jobs applied for dashboard');
        err.msg = 'Unauthorized request';
        err.status = 403;
        return next(err);
    }
    next();
};