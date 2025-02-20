const jobsAppliedForService = require('./jobsAppliedForService');

exports.getCompaniesFilter = async (req, res, next) => {
    const { userId } = req;

    try {
        const result = await jobsAppliedForService.getCompaniesFilter(userId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};