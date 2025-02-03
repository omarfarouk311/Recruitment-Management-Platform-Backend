const recruitment_processService = require('./recruitment_processService');



module.exports.getRecruitmentProcess = async (req, res, next) => {
    try {
        // parameter should be req.id
        // const companyId = req.id;
        const recruitment_process = await recruitment_processService.getRecruitmentProcess(1);
        if (!recruitment_process || recruitment_process.length === 0) {
            return res.status(200).json({ success: true, message: 'No recruitment process added yet' });
        }
        res.status(200).json({ recruitment_process });
    } catch (error) {
        console.log("Error in getRecruitmentProcess in controller file with error msg", error);
        // next(error);
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }
} 


module.exports.getRecruitmentProcessById = async (req, res, next) => {
    const { processId } = req.params;
    try {
        const recruitment_process = await recruitment_processService.getRecruitmentProcessById(processId);
        if (!recruitment_process || recruitment_process.length == 0) {
            return res.status(200).json({ message: 'No phases added to this process yet' });
        }
        res.status(200).json({ recruitment_process });
    }
    catch(error) {
        console.log("Error in getRecruitmentProcessById in controller file with error msg", error);
        // next(error);
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }
}


module.exports.updateRecruitmentProcess = async (req, res, next) => {
    const { processId } = req.params;
    const data = req.body.phases;
    try {
        const recruitment_process = await recruitment_processService.updateRecruitmentProcess(processId, data);
        res.status(200).send(recruitment_process );
    } catch (error) {
        console.log("Error in updateRecruitmentProcess in controller file with error msg", error);
        // next(error);
        return res.status(error.statusCode).json({ message: error.message, details: error.details });

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
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
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
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }
}