const reviewModel = require('./reviewModel');

exports.createReview = async (reviewData) => {
    result = await reviewModel.createReview(reviewData);
    return result;
};

exports.updateReview = async (reviewData) => {

    result = await reviewModel.updateReview(reviewData);
    return result;
};

exports.deleteReview = async (reviewId) => {

    const result = await reviewModel.deleteReview(reviewId);
    return result;
};
