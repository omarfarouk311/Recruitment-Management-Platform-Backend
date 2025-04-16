const { CompanyModel } = require('./companyModel');
const constants = require('../../../../config/config');

exports.getCompanies = async (name, type, minSize, maxSize, industry, city, country, rating, page) => {
    const offset = (page - 1) * constants.pagination_limit;
    return CompanyModel.getCompanies(name, type, minSize, maxSize, industry, city, country, rating, offset);
}

exports.getCompaniesFilter = async (userId) => {
    const companies = await CompanyModel.getCompaniesFilter(userId);
    return companies;
}