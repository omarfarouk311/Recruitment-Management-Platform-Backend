const Review = require('./reviewModel');

exports.createReview = async (reviewData) => {
    const { creatorId, companyId, title, description, rating, role } = reviewData;
    const review = new Review({
        creatorId,
        companyId,
        title,
        description,
        rating,
        role,
        createdAt: new Date()
    });

    result = await review.create()
    return result;
};

exports.updateReview = async (reviewData) => {
    const { id, title, description, rating, role } = reviewData;
    const review = new Review({
        id,
        title,
        description,
        rating,
        role
    });

    await review.update();
};

exports.deleteReview = async (reviewId) => {
    await Review.delete(reviewId);
};