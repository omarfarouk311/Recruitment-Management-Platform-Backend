const { role } = require('../../../../config/config');


exports.isSeeker = (req, res, next) => {
    if (!req.userId || req.userRole !== role.jobSeeker) {
        return res.sendStatus(403);
    }
    next();
}