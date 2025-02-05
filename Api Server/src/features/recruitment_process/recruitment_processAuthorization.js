const recruitment_processModel = require('./recruitment_processModel');


module.exports.authorizeRecruitmentProcess = async (req, res, next) => {
    let companyId = req.userId;
    const recruitmentProcessId = req.params.processId;
    try {
        const retrievedCompanyId = await recruitment_processModel.getProcessById(recruitmentProcessId);
        if (retrievedCompanyId !== companyId) {
            const error = new Error('You are not authorized to access this recruitment process');
            error.status = 403;
            error.msg = 'Authorization Error';
            throw error;

        }
       next();
    }
    catch (error) {
        console.log('Error in: authorizeRecruitmentProcess', error);
        next(error);
    }
}