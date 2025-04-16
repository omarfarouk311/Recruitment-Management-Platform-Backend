const jobService = require('./jobService');

exports.getRecommendedJobs = async (req, res, next) => {
    const data = {
        seekerId: req.userId,
        filters: req.query
    }

    try {
        const jobs = await jobService.getRecommendedJobs(data);
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
};

exports.getSearchedJobs = async (req, res, next) => {
    const data = {
        filters: req.query
    }

    try {
        const jobs = await jobService.getSearchedJobs(data);
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
};

exports.applyToJob = async (req, res, next) => {
    const data = {
        seekerId: req.userId,
        cvId: req.body.cvId,
        jobId: req.body.jobId
    };

    try {
        await jobService.applyToJob(data);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};

exports.removeRecommendation = async (req, res, next) => {
    const data = {
        seekerId: req.userId,
        jobId: req.params.jobId
    };

    try {
        await jobService.removeRecommendation(data);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};