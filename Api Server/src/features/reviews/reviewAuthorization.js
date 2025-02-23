const reviewModel = require('./reviewModel');


exports.authUpdateReview = async (req, res, next) => {
    try {
        // Assuming the user is authenticated and req.userId is available
        // Check if the user is the creator of the review they are trying to update
        const reviewId = req.params.reviewId;
        const userId = req.userId;

        const review = await reviewModel.getReviewById(reviewId);
        if (!review || review.creatorId !== userId) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }

        next();
    } catch (error) {
        console.error("Error in authUpdateReview middleware", error);
        next(error);
    }
};

exports.authDeleteReview = async (req, res, next) => {
    try {
        // Assuming the user is authenticated and req.userId is available
        // Check if the user is the creator of the review they are trying to delete
        const reviewId = req.params.reviewId;
        const userId = req.userId;

        const review = await reviewModel.getReviewById(reviewId);
        if (!review || review.creatorId !== userId) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }

        next();
    } catch (error) {
        console.error("Error in authDeleteReview middleware", error);
        next(error);
    }
};