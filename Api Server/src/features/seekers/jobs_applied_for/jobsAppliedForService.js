const JobsAppliedFor = require('./jobsAppliedForModel');

exports.getCompaniesFilter = async (seekerId) => {
    return await JobsAppliedFor.getCompaniesFilter(seekerId);
};

exports.getLocationsFilter = async (seekerId) => {
    return await JobsAppliedFor.getLocationsFilter(seekerId);
};