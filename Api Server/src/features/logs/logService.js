const logModel = require('./logModel');

exports.getLogs = async (companyId, filters) => {
    const result = await logModel.getLogs(companyId, filters);
    return result
};
