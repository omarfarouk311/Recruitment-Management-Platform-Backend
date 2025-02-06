const recruitment_processModel = require('./recruitment_processModel');
const { role } = require('../../../config/config')



module.exports.RecruitmenProcessesAuthorization = async (req, res, next) => {
    if (req.userRole == role.jobSeeker || req.userRole == role.recruiter) {
        const error = new Error('You are not authorized to access this recruitment process');
        error.status = 403;
        error.msg = 'Authorization Error';
        next(error);
    }
    next();
}

module.exports.RecruitmenProcessDetailsAuthorization = async (req, res, next) => {
    const companyId = req.userId || 2;
    const recruitmentProcessId = req.params.processId;
    if (req.userRole == role.jobSeeker || req.userRole == role.recruiter) {
        const error = new Error('You are not authorized to access this recruitment process');
        error.status = 403;
        error.msg = 'Authorization Error';
        next(error);
    }
    try {
        const company_id = await recruitment_processModel.getCompanyIdOfProcess(recruitmentProcessId);
        if (companyId != company_id) {
            const error = new Error('You are not authorized to access this recruitment process');
            error.status = 403;
            error.msg = 'Authorization Error';
            throw error;
        }
        next();
    } catch (err) {
        next(err);
    }
}
