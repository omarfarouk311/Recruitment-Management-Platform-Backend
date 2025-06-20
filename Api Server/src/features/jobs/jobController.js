const jobService = require('./jobService')


module.exports.createJob = async (req, res, next) => {
    const jobData = req.body;
    const companyId = req.userId
    try {
        const jobId = await jobService.createJob(companyId, jobData);
        res.status(201).json({id: jobId});
    } catch (err) {
        next(err);
    }
}


module.exports.getJobDetailsById = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const job = await jobService.getJobDetailsById(jobId, req.userId, req.userRole);
        res.status(200).json(job);
    } catch (err) {
        next(err);
    }
}


module.exports.closeJobById = async (req, res, next) => {
    const jobId = req.params.id;
    const companyId = req.userId;
    try {
        const msg = await jobService.closeJobById(companyId, jobId);
        res.status(200).json(msg);
    } catch (err) {
        next(err);
    }
}


module.exports.updateJobById = async (req, res, next) => {
    const jobId = req.params.id;
    const jobData = req.body;
    try {
        const msg = await jobService.updateJobById(req.userId, jobId, jobData);
        res.status(200).json(msg);
    } catch (err) {
        next(err);
    }
}


module.exports.getJobDataForEditing = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const job = await jobService.getJobDataForEditing(jobId);
        res.status(200).send(job);
    } catch (err) {
        next(err);
    }
}


module.exports.getSimilarJobs = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const jobs = await jobService.getSimilarJobs(jobId);
        res.status(200).json(jobs);
    } catch (err) {
        next(err);
    }
}