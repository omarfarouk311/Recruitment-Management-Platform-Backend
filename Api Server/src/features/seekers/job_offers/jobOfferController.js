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
    try {
        const jobOffer = await jobOfferService.getJobOffer(req.userId, req.params.jobId);
        res.status(200).json(jobOffer);
    } catch(error) {
        next(error);
    }
}

exports.replyToJobOffer = async (req, res, next) => {
    try {
        const jobOffer = await jobOfferService.replyToJobOffer(req.userId, req.params.jobId, req.body.status);
        console.log(jobOffer);
        if (jobOffer)
            return res.sendStatus(200);
        res.status(404).json({message: 'Job offer not found'});
    } catch(error) {
        next(error);
    }
}

exports.getCompanyName = async (req, res, next) => {
    console.log('Not Implemented Yet');
}