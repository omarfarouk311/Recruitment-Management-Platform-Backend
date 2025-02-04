const companyModel = require('./companyModel');

exports.getCompanyData = async (companyId) => {
    const result = await companyModel.getCompanyData(companyId);
    return result;
};