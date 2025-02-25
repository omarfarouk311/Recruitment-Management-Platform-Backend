const jobService = require('./jobService');

exports.getRecommendedJobs = async (req, res, next) => {
    const { userId, query } = req;

    try {
        const jobs = await jobService.getRecommendedJobs(userId, query);
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
};

exports.getSearchedJobs = async (req, res, next) => {
    const { query } = req;

    try {
        const jobs = await jobService.getSearchedJobs(query);
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
};

exports.applyToJob = async (req, res, next) => {
    const { userId, body } = req;

    try {
        await jobService.applyToJob(userId, body);
        res.status(201).send();
    }
    catch (err) {
        next(err);
    }
};