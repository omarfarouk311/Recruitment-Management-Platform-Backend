const { role } = require('../../../config/config')

// interview data that can be accessed only by companies and recruiters
module.exports.getRecruiterAndCompanInterviewsAuth = async (req, res, next) => {
    try {
        if(req.userRole == role.jobSeeker){
            const error = new Error('Job seeker is not authotized to access this data');
            error.msg = 'Authorization error';
            error.status = 403;
            throw error;
        }
        next();
    } catch (err) {
        next(err);
    }
}