const jobModel = require('./jobModel')

module.exports.createJob = async (companyId, jobData) => {
    const response = await jobModel.createJob(companyId, jobData)
    return response
}


module.exports.getAllJobs = async (companyId, filters) => {
    const jobs = await jobModel.getAllJobs(companyId, filters)
    return jobs
}

module.exports.getJobById = async (jobId) => {
    const job = await jobModel.getJobById(jobId)
    return job
}