
const recruitment_processModel = require('./recruitment_processModel');


module.exports.getRecruitmentProcess = async (companyId, query) => {
        const recruitment_process = await recruitment_processModel.getRecruitmentProcess(companyId, query);
        return recruitment_process;
}

module.exports.getRecruitmentProcessDetails = async (processId) => {
        const recruitment_process = await recruitment_processModel.getRecruitmentProcessDetails(processId);
        return recruitment_process;
}

module.exports.updateRecruitmentProcess = async (companyId, processId, processName, data) => {
        const recruitment_process = await recruitment_processModel.updateRecruitmentProcess(companyId, processId, processName, data);
        return recruitment_process;
}

module.exports.CreateRecruitmentProcess = async (companyId, processName, data) => {
        const recruitment_process = await recruitment_processModel.createRecruitmentProcess(companyId, processName, data);
        return recruitment_process;
}

module.exports.deleteRecruitmentProcess = async (company_id, processId) => {
        const recruitment_process = await recruitment_processModel.deleteRecruitmentProcess(company_id, processId);
        return recruitment_process;
}

module.exports.getPhases = async () => {
        const recruitment_process = await recruitment_processModel.getPhases();
        return recruitment_process;
}