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

exports.updateCompanyData = async (companyId, { name, overview, type, foundedIn, size, locations, industries }) => {
    const company = new Company(companyId, overview, type, foundedIn, size, name, locations, industries);
    await company.update();
};

exports.getCompanyReviews = (companyId, filters) => {
    return Company.getCompanyReviews(companyId, filters);
};