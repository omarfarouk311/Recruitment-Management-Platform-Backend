const JobsAppliedFor = require('./jobsAppliedForModel');

exports.getCompaniesFilter = async (seekerId) => {
    return await JobsAppliedFor.getCompaniesFilter(seekerId);
};

exports.getLocationsFilter = async (seekerId) => {
    return await JobsAppliedFor.getLocationsFilter(seekerId);
};

exports.getJobsAppliedFor = async (seekerId, filters) => {
    return await JobsAppliedFor.getJobsAppliedFor(seekerId, filters);
};