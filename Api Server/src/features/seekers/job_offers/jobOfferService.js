const { JobOfferModel } = require('./jobOfferModel');
const constants = require('../../../../config/config');

exports.getJobOffers = async (userId, status, country, city, companyId, sort, page) => {
    let offset = (page - 1) * constants.pagination_limit;
    return await JobOfferModel.getJobOffers(userId, status, country, city, companyId, sort, offset);
};