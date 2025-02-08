const companyModel = require('./companyModel');
const { client } = require('../../../config/MinIO');
const { imagesBucketName } = require('../../../config/config');

exports.getCompanyData = async (companyId) => {
    const result = await companyModel.getCompanyData(companyId);
    return result;
};

exports.getCompanyLocations = async (companyId) => {
    const result = await companyModel.getCompanyLocations(companyId);
    return result;
};

exports.getCompanyIndustries = async (companyId) => {
    const result = await companyModel.getCompanyIndustries(companyId);
    return result;
};

exports.getCompanyJobs = async (companyId, filters, userRole) => {
    let result;
    if (filters.simplified) {
        result = await companyModel.getCompanyJobsSimplified(companyId, filters, userRole);
    }
    else if (filters.filterBar) {
        result = await companyModel.getCompanyJobsFilterBar(companyId, userRole);
    }
    else result = await companyModel.getCompanyJobs(companyId, filters, userRole);
    return result;
};

exports.updateCompanyData = async (companyId, data) => {
    await companyModel.updateCompanyData(companyId, data);
};

exports.getCompanyPhoto = async (companyId) => {
    const objectName = `company${companyId}`;
    const stat = await client.statObject(imagesBucketName, objectName);
    const stream = await client.getObject(imagesBucketName, objectName);
    return { stat, stream };
};