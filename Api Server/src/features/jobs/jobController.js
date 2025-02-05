const jobService = require('./jobService')


module.exports.createJob = async (req, res, next) => {
    const jobData = req.body;
    const companyId = req.userId || 1
    try {
        const msg = await jobService.createJob(companyId, jobData);
        res.status(201).json(msg);
    } catch (err) {
        next(err);
    }
}


module.exports.getAllCompanyJobs = async (req, res, next) => {
    const companyId = req.userId || 1
    const filters = req.query;
    try {
        const jobs = await jobService.getAllCompanyJobs(companyId, filters);
        res.status(200).json({ jobs });
    } catch (err) {
        next(err);
    }
}


module.exports.getJobDetailsById = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const job = await jobService.getJobDetailsById(jobId);
        res.status(200).json({ job });
    } catch (err) {
        next(err);
    }
}


module.exports.deleteJobById = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const msg = await jobService.deleteJobById(jobId);
        res.status(200).json(msg);
    } catch (err) {
        next(err);
    }
}


module.exports.updateJoById = async (req, res, next) => {
    const jobId = req.params.id;
    const jobData = req.body;
    try {
        const msg = await jobService.updateJobById(req.userId, jobId, jobData);
        res.status(200).json(msg);
    } catch (err) {
        next(err);
    }
}
