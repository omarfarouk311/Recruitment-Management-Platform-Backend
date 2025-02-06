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
