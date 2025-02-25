const { role } = require('../../../../config/config');

exports.authorizeUpdateProfile = (req, res, next) => {
    if (req.userRole === role.jobSeeker) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: You do not have permission to access this endpoint.' });
    }
}