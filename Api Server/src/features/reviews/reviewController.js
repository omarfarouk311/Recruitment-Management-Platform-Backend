const reviewService = require('./reviewService');

exports.getReviews = async (req, res, next) => {
    const { companyId } = req.params;
    // page property is mandatory, validation fails without it
    const filters = req.query;

    try {
        const reviews = await reviewService.getReviews(companyId, filters);
        res.status(200).json(reviews);
    }
    catch (err) {
        err.statusCode = 500;
        err.message = 'Internal server error';
        return next(err)
    }
};
