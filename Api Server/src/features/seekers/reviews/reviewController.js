const reviewService = require('./reviewService');

exports.getSeekerReviews = async (req, res, next) => {
    const { userId: seekerId, query: filters } = req;

    try {
        const response = await reviewService.getSeekerReviews(seekerId, filters);
        res.status(200).json(response);
    }
    catch (err) {
        next(err);
    }
};