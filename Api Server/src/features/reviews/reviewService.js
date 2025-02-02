const reviewModel = require('./reviewModel');

exports.getReviews = async (companyId, page, filters) => {
    const result = await reviewModel.getReviews(companyId, page, filters);
    return result;
};