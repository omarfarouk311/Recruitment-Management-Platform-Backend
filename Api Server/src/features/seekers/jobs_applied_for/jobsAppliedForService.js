const JobsAppliedFor = require('./jobsAppliedForModel');

exports.getCompaniesFilter = async (seekerId) => {
    return await JobsAppliedFor.getCompaniesFilter(seekerId);
};