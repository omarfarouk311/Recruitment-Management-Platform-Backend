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


module.exports.getAllJobs = async (req, res, next) => {
    const companyId = req.userId || 1
    const filters = req.query;
    try {
        const jobs = await jobService.getAllJobs(companyId, filters);
        res.status(200).json({ jobs });
    } catch (err) {
        next(err);
    }
}


module.exports.getJobById = async (req, res, next) => {
    const jobId = req.params.id;
    try {
        const job = await jobService.getJobById(jobId);
        res.status(200).json({ job });
    } catch (err) {
        next(err);
    }
}
