const reviewService = require('./reviewService');

exports.createReview = async (req, res, next) => {
    try {
        const reviewData = {
            creatorId: req.userId,
            companyId: req.body.companyId,
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            role: req.body.role
        };

        const review = await reviewService.createReview(reviewData);
        res.status(201).json(review);
    }
    catch (error) {
        next(error);
    }
};

exports.updateReview = async (req, res, next) => {
    try {
        const reviewData = {
            id: req.params.reviewId,
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            role: req.body.role
        };

        await reviewService.updateReview(reviewData);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const { params: { reviewId } } = req;
        await reviewService.deleteReview(reviewId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};