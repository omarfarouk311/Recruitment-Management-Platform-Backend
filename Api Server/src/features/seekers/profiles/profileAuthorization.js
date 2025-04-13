const { role } = require('../../../../config/config');

exports.authorizeUpdateProfile = (req, res, next) => {
    if (req.userRole === role.jobSeeker) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: You do not have permission to access this endpoint.' });
    }
};

exports.authorizeUpdateProfileImage = (req, res, next) => {
    if (req.userId != req.params.seekerId || req.userRole !== role.jobSeeker) {
        const err = new Error('Unauthorized access on uploading seeker image');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};