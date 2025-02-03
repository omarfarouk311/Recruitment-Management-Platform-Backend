
const recruitment_processModel = require('./recruitment_processModel');


module.exports.getRecruitmentProcess = async (companyId) => {
        const recruitment_process = await recruitment_processModel.getRecruitmentProcess(companyId);
        return recruitment_process;
}

module.exports.getRecruitmentProcessById = async (processId) => {
        const recruitment_process = await recruitment_processModel.getRecruitmentProcessById(processId);
        return recruitment_process;
}

module.exports.updateRecruitmentProcess = async (companyId, processId, data) => {
        const recruitment_process = await recruitment_processModel.updateRecruitmentProcess(companyId, processId, data);
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