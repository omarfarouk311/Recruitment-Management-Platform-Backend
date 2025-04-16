const jobModel = require('./jobModel')
const { role } = require('../../../config/config')


module.exports.jobOfCompanyAuthorization = async (req, res, next) => {
    try {
        if(req.userRole == role.jobSeeker || req.userRole == role.recruiter) {
            const error = new Error('You are not authorized to access this job');
            error.status = 403;
            error.msg = 'Authorization Error';
            throw error;
        }
        next()
    } catch (err) {
        next(err);
    }
}


module.exports.deleteUpdateJobAuthorization = async (req, res, next) => {
    let id = req.userId 
    const jobId = req.params.id;
    try {
        if (req.userRole == role.jobSeeker || req.userRole == role.recruiter) {
            const error = new Error('You are not authorized to access this job');
            error.status = 403;
            error.msg = 'Authorization Error';
            throw error;
        }
        const company_id = await jobModel.getCompanyIdOfJob(jobId);
        if (company_id != id) {
            const error = new Error('You are not authorized to access this job');
            error.status = 403;
            error.msg = 'Authorization Error';
            throw error;
        }
        next();
    } catch (err) {
        next(err);
    }
}

module.exports.similarJobs = async (req, res, next) => {
    try {
       if(req.userRole == role.jobSeeker) {
           return next();
        } 
        const error = new Error('You are not authorized to access this job');
        error.status = 403;
        error.msg = 'Authorization Error';
        throw error;
    } catch (err) {
        next(err);
    }
}