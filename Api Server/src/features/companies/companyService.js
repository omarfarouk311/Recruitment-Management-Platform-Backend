const Company = require('./companyModel');

exports.getCompanyData = async (companyId) => {
    const result = await Company.getCompanyData(companyId);
    return result;
};

exports.getCompanyLocations = async (companyId) => {
    const result = await Company.getCompanyLocations(companyId);
    return result;
};

exports.getCompanyIndustries = async (companyId) => {
    const result = await Company.getCompanyIndustries(companyId);
    return result;
};

exports.getCompanyJobs = async (companyId, filters, userId) => {
    let result;
    if (filters.filterBar) {
        result = await Company.getCompanyJobsFilterBar(companyId, userId);
    }
    else result = await Company.getCompanyJobs(companyId, filters, userId);
    return result;
};

exports.updateCompanyProfile = async (companyData) => {
    const company = new Company(companyData);
    await company.update();
};

exports.finishCompanyProfile = async (companyData) => {
    const company = new Company(companyData);
    await company.create();
};

exports.getCompanyReviews = (companyId, filters) => {
    return Company.getCompanyReviews(companyId, filters);
};