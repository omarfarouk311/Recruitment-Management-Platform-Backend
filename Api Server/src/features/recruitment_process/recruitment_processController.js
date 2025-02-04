const recruitment_processService = require('./recruitment_processService');



module.exports.getRecruitmentProcess = async (req, res, next) => {
    try {
        // parameter should be req.id
        let companyId = req.id; 
        const page = req.query.page || 1;
        const recruitment_process = await recruitment_processService.getRecruitmentProcess(companyId, page);
        if (!recruitment_process || recruitment_process.length === 0) {
            return res.status(200).json({ message: 'No recruitment process in the current page' });
        }
        res.status(200).json({ recruitment_process });
    } catch (error) {
        // next(error);
        return res.status(error.status).json({ message: error.msg || "inernal server error" });
    }
} 


module.exports.getRecruitmentProcessById = async (req, res, next) => {
    const { processId } = req.params;
    try {
        const recruitment_process = await recruitment_processService.getRecruitmentProcessById(processId);
        res.status(200).json({ recruitment_process });
    }
    catch(error) {
        console.log("Error in getRecruitmentProcessById in controller file with error msg", error);
        // next(error);
        return res.status(error.status).json({ message: error.msg || "inernal server error" });
    }
}


module.exports.updateRecruitmentProcess = async (req, res, next) => {
    const { processId } = req.params;
    const data = req.body.phases;
    let companyId = req.id; companyId = 1;
    const processName = req.body.processName;
    try {
        const recruitment_process = await recruitment_processService.updateRecruitmentProcess(companyId, processId, processName, data);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in updateRecruitmentProcess in controller file with error msg", error);
        // next(error);
        return res.status(error.status).json({ message: error.msg || "inernal server error" });

    }
}


module.exports.CreateRecruitmentProcess = async (req, res, next) => {
    const data = req.body.phases;
    let companyId = req.id; companyId = 1;
    const processName = req.body.processName;
    
    try {
        const recruitment_process = await recruitment_processService.CreateRecruitmentProcess(companyId, processName, data);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in CreateRecruitmentProcess in controller file with error msg", error);
        // next(error);
        return res.status(error.status).json({ message: error.msg || "inernal server error" });
    }
}


module.exports.deleteRecruitmentProcess = async (req, res, next) => {  
    const { processId } = req.params;
    let companyId = req.id; companyId = 1;
    try {
        const recruitment_process = await recruitment_processService.deleteRecruitmentProcess(companyId, processId);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in deleteRecruitmentProcess in controller file with error msg", error);
        // next(error);
        return res.status(error.status).json({ message: error.msg || "inernal server error" });
    }
}