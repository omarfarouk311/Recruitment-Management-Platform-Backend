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