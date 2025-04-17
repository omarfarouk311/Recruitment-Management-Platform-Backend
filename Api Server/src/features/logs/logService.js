const Log = require('./logModel');

exports.getLogs = (companyId, filters) => {
    return Log.getLogs(companyId, filters);
};

exports.getActions = () => {
    return Log.getActions();
}