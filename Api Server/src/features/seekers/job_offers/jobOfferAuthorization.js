const { role } = require('../../../../config/config');

exports.isJobSeeker = (req, res, next) => {
    if (req.userRole !== role.jobSeeker) {
        return res.status(403).json({ message: 'You are not a job seeker' });
    }
    next();
}