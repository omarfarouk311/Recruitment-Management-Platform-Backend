const CandidateQueryset = require('./candidateModel').CandidateModel;
const limit = require('../../../config/config').pagination_limit;

exports.getCandidatesForJob = async (jobId, filters, sortBy, page) => {
    offset = (page - 1) * limit;
    return CandidateQueryset.getCandidatesForJob(jobId, filters, sortBy, limit, offset);
};

exports.getCandidatesForRecruiter = async (recruiterId, simplified, filters, sortBy, page=1 ) => {
    offset = (page - 1) * limit;
    return CandidateQueryset.getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, pagination_limit, offset);
};

exports.assignCandidatesToRecruiter = async (seekerId, recruiterId, jobId) => {
    return CandidateQueryset.assignCandidatesToRecruiter(seekerId, recruiterId, jobId);
};

exports.MakeDecisionToCandidates = async (seekerIds, jobId, decision) => {
    return CandidateQueryset.makeDecisionToCandidates(seekerIds, jobId, decision);
};

exports.unassignCandidatesFromRecruiter = async (seekerId, jobId) => {
    return CandidateQueryset.unassignCandidatesFromRecruiter(seekerId, jobId);
};