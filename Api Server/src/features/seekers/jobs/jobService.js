const Job = require('./jobModel');

exports.getRecommendedJobs = async (seekerId, filters) => {
    return await Job.getRecommendedJobs(seekerId, filters);
};

exports.getSearchedJobs = async (filters) => {
    return await Job.getSearchedJobs(filters);
};