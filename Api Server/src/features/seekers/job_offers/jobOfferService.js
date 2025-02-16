const { JobOfferModel } = require('./jobOfferModel');
const constants = require('../../../../config/config');

exports.getJobOffers = async (userId, status, country, city, companyId, sort, page) => {
    let offset = (page - 1) * constants.pagination_limit;
    return await JobOfferModel.getJobOffers(userId, status, country, city, companyId, sort, offset);
};

exports.getJobOffer = async (userId, jobId) => {
    let result = await JobOfferModel.getJobOffer(userId, jobId);
    result.offer = result.offer.replace(/{{(.+?)}}/g, (match, p1) => {
        return result.placeholdersParams[p1] || match;
    });
    return result;
}