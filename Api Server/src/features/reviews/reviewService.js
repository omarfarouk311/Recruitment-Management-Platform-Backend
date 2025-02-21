const reviewModel = require('./reviewModel');


exports.getReviews = async (companyId, filters) => {
    const result = await reviewModel.getReviews(companyId, filters);
    return result;
};

exports.createReview = async (reviewData) => {
    result = await reviewModel.createReview(reviewData);
    await reviewModel.updateCompanyAvgRating(reviewData.companyId);
    return result;
};

exports.updateReview = async (reviewData) => {

    result = await reviewModel.updateReview(reviewData);
    await reviewModel.updateCompanyAvgRating(reviewData.companyId);
    return result;
};

exports.deleteReview = async (reviewId) => {
    // Get the review to retrieve the companyId
    const review = await reviewModel.getReviewById(reviewId);
    if (!review) {
        throw new Error('Review not found');
    }

    // Delete the review
    const result = await reviewModel.deleteReview(reviewId);

    // Update the company's average rating
    await reviewModel.updateCompanyAvgRating(review.companyId);

    
};
