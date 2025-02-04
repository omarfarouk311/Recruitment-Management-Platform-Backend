const companyModel = require('./companyModel');

exports.getCompanyData = async (companyId) => {
    const result = await companyModel.getCompanyData(companyId);
    return result;
};

exports.getCompanyLocations = async (companyId) => {
    const result = await companyModel.getCompanyLocations(companyId);
    return result;
};