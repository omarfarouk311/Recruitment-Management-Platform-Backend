const reviewModel = require('./reviewModel');

exports.getReviews = async (companyId, filters) => {
    const result = await reviewModel.getReviews(companyId, filters);
    return result;
};