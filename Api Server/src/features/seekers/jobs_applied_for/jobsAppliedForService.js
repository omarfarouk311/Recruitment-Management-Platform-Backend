const JobsAppliedFor = require('./jobsAppliedForModel');

exports.getCompaniesFilter = (seekerId) => {
    return JobsAppliedFor.getCompaniesFilter(seekerId);
};

exports.getLocationsFilter = (seekerId) => {
    return JobsAppliedFor.getLocationsFilter(seekerId);
};

exports.getJobsAppliedFor = (seekerId, filters) => {
    return JobsAppliedFor.getJobsAppliedFor(seekerId, filters);
};