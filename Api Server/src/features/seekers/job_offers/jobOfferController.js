const jobOfferService = require('./jobOfferService');

exports.getJobOffers = async (req, res, next) => {
    try {
        const jobOffers = await jobOfferService.getJobOffers(
            req.userId,
            req.query.status,
            req.query.country,
            req.query.city,
            req.query.companyId,
            req.query.sort,
            req.query.page || 1
        );
        res.status(200).json(jobOffers);
    } catch (error) {
        next(error);
    }
};

exports.getJobOffer = async (req, res, next) => {
    console.log('Not Implemented Yet');
}

exports.replyToJobOffer = async (req, res, next) => {
    console.log('Not Implemented Yet');
}

exports.getCompanyName = async (req, res, next) => {
    console.log('Not Implemented Yet');
}