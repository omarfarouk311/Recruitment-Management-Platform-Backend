const { role: { jobSeeker } } = require('../../../../config/config');

exports.authorizeAccess = (req, res, next) => {
    if (req.userRole !== jobSeeker) {
        const err = new Error('Unauthorized access, only job seekers are allowed to access this route');
        err.msg = 'Unauthorized request';
        err.status = 403;
        return next(err);
    }
    next();
};