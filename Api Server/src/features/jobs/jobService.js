const jobModel = require('./jobModel')

module.exports.createJob = async (companyId, jobData) => {
    const response = await jobModel.createJob(companyId, jobData)
    return response
}


module.exports.getAllCompanyJobs = async (companyId, filters) => {
    const jobs = await jobModel.getAllCompanyJobs(companyId, filters)
    return jobs
}

module.exports.getJobDetailsById = async (jobId) => {
    const job = await jobModel.getJobDetailsById(jobId)
    return job
}

module.exports.deleteJobById = async (companyId, jobId) => {
    const response = await jobModel.deleteJobById(companyId, jobId)
    return response
}

module.exports.updateJobById = async (companyId, jobId, jobData) => {
    const response = await jobModel.updateJobById(companyId, jobId, jobData)
    return response
    
}