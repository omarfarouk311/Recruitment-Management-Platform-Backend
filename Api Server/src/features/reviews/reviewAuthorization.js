const Review = require('./reviewModel');
const { role: { jobSeeker } } = require('../../../config/config');

exports.authorizeModifyReview = (operation) => {
    return async (req, res, next) => {
        try {
            // Check if the user is the creator of the review they are trying to modify
            const { params: { reviewId }, userId } = req;
            const review = await Review.getReviewById(reviewId);

            if (!review) {
                const err = new Error(`Review not found while trying to ${operation == 1 ? 'update' : 'delete'} it`);
                err.msg = 'Review not found';
                err.status = 404;
                throw err;
            }

            if (review.creatorId !== userId) {
                const err = new Error(`Unauthorized attempt to ${operation == 1 ? 'update' : 'delete'} a review`);
                err.msg = 'Unauthorized Access';
                err.status = 403;
                throw err;
            }

            next();
        }
        catch (error) {
            next(error);
        }
    }
};

exports.authorizeCreateReview = (req, res, next) => {
    const { userRole } = req;

    if (userRole !== jobSeeker) {
        const err = new Error('Unauthorized attempt to create a review');
        err.msg = 'Unauthorized Access';
        err.status = 403;
        return next(err);
    }

    next();
};