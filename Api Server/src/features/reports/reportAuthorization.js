const { role: { jobSeeker } } = require('../../../config/config');

exports.authorizeReportCreation = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== jobSeeker) {
        const err = new Error('Unauthorized access on reports');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};
