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

exports.getJobsAppliedFor = async (req, res, next) => {
    const { userId, query } = req;

    try {
        const jobs = await jobsAppliedForService.getJobsAppliedFor(userId, query);
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
};