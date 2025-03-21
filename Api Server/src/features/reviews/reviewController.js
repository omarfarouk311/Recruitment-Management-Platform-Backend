const reviewService = require('./reviewService');

exports.getReviews = async (req, res, next) => {
    const { companyId } = req.params;
    const filters = req.query;

    try {
        const reviews = await reviewService.getReviews(companyId, filters);
        res.status(200).json(reviews);
    }
    catch (err) {
        err.status = 500;
        err.msg = 'Internal server error';
        return next(err)
    }
};

exports.createReview = async (req, res, next) => {
    try {
        const reviewData = {
            creatorId: req.userId,
            companyId: req.params.companyId, // Get companyId from req.params
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            role: req.body.role
        };
        const review = await reviewService.createReview(reviewData);
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};


exports.updateReview = async (req, res, next) => {
    try {
        const reviewData = {
            reviewId: req.params.reviewId,
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            role: req.body.role
        };
        const review = await reviewService.updateReview(reviewData);
        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
};


exports.deleteReview = async (req, res, next) => {
    try {
        const reviewId = req.params.reviewId;
        const review = await reviewService.deleteReview(reviewId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
