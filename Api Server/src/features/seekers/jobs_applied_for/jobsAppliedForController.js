const jobsAppliedForService = require('./jobsAppliedForService');

exports.getCompaniesFilter = async (req, res, next) => {
    const { userId } = req;

    try {
        const companiesNames = await jobsAppliedForService.getCompaniesFilter(userId);
        res.status(200).json(companiesNames);
    }
    catch (err) {
        next(err);
    }
};

exports.getLocationsFilter = async (req, res, next) => {
    const { userId } = req;

    try {
        const locations = await jobsAppliedForService.getLocationsFilter(userId);
        res.status(200).json(locations);
    }
    catch (err) {
        next(err);
    }
};