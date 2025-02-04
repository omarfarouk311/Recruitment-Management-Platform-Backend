const recruitment_processModel = require('./recruitment_processModel');


module.exports.authorizeRecruitmentProcess = async (req, res, next) => {
    let companyId = req.id; companyId = 2;
    const recruitmentProcessId = req.params.processId;
    
    try {
        const retrievedCompanyId = await recruitment_processModel.getProcessById(recruitmentProcessId);
        if (retrievedCompanyId !== companyId) {
            return res.status(403).json({ message: 'not Authorized' });
        }
       next();
    }
    catch (error) {
        console.log('Error in: authorizeRecruitmentProcess', error);
        // next(error);
        return res.status(500).json({ message: error.message  });
    }
}