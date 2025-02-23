const Log = require('./logModel');

exports.getLogs = async (companyId, filters) => {
    return await Log.getLogs(companyId, filters);
};

exports.getActions = async () => await Log.getActions();