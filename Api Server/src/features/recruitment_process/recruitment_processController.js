const recruitment_processService = require('./recruitment_processService');


module.exports.getRecruitmentProcess = async (req, res, next) => {
    try {
        let companyId = req.userId || 3;
        const query = req.query;
        const recruitment_process = await recruitment_processService.getRecruitmentProcess(companyId, query);
        if (!recruitment_process || recruitment_process.length === 0) {
            return res.status(200).json({ message: 'No recruitment process in the current page' });
        }
        res.status(200).json({ recruitment_process });
    } catch (error) {
        next(error);
    }
} 


module.exports.getRecruitmentProcessDetails = async (req, res, next) => {
    const { processId } = req.params;
    try {
        const recruitment_process = await recruitment_processService.getRecruitmentProcessDetails(processId);
        res.status(200).json({ recruitment_process });
    }
    catch(error) {
        console.log("Error in getRecruitmentProcessById in controller file with error msg");
        next(error);
    }
}


module.exports.updateRecruitmentProcess = async (req, res, next) => {
    const { processId } = req.params;
    const data = req.body.phases;
    let companyId = req.userId || 3;
    const processName = req.body.processName;
    try {
        const recruitment_process = await recruitment_processService.updateRecruitmentProcess(companyId, processId, processName, data);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in updateRecruitmentProcess in controller file with error msg");
        next(error);
    }
}


module.exports.CreateRecruitmentProcess = async (req, res, next) => {
    const data = req.body.phases;
    let companyId = req.userId || 3;
    const processName = req.body.processName;
    
    try {
        const recruitment_process = await recruitment_processService.CreateRecruitmentProcess(companyId, processName, data);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in CreateRecruitmentProcess in controller file with error msg");
        next(error);
    }
}


module.exports.deleteRecruitmentProcess = async (req, res, next) => {  
    const { processId } = req.params;
    let companyId = req.userId;
    try {
        const recruitment_process = await recruitment_processService.deleteRecruitmentProcess(companyId, processId);
        res.status(200).send(recruitment_process);
    } catch (error) {
        console.log("Error in deleteRecruitmentProcess in controller file with error msg");
        next(error);
    }
}


module.exports.getPhases = async (req, res, next) => {
    try {
        const phases = await recruitment_processService.getPhases();
        res.status(200).json({ phases });
    } catch (error) {
        next(error);
    }
}