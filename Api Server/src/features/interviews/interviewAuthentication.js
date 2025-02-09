const { role } = require('../../../config/config')
const { getRecruiterId } = require('./interviewModel')

// interview data that can be accessed only by companies and recruiters
module.exports.recruiterAndCompanyInterviewsAuth = async (req, res, next) => {
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

module.exports.dateInterviewModificationAuth = async (req, res, next) => {
    try {
        if (req.userRole == role.jobSeeker || req.userRole == role.company) {
            const error = new Error('not authotized to access this data');
            error.msg = 'Authorization error';
            error.status = 403;
            throw error;
        }
        const { jobId, seekerId } = req.params;
        const recruiterId = await getRecruiterId(jobId, seekerId);
        if (recruiterId != req.userId) {
            const error = new Error('not authotized to access this data')
            error.msg = 'Authorization error';
            error.status = 403;
            throw error;
        }

        next();
    } catch (err) {
        next(err);
    }
}