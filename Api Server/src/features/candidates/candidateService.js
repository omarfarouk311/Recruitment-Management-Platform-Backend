const CandidateQueryset = require('./candidateModel').CandidateModel;
const limit = require('../../../config/config').pagination_limit;

exports.getCandidatesForJob = async (jobId, filters, sortBy, page) => {
    offset = (page - 1) * limit;
    return CandidateQueryset.getCandidatesForJob(jobId, filters, sortBy, limit, offset);
};

exports.getCandidatesForRecruiter = async (recruiterId, simplified, filters, sortBy, page=1 ) => {
    offset = (page - 1) * limit;
    return CandidateQueryset.getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, limit, offset);
};

exports.assignCandidatesToRecruiter = async (seekerIds, recruiterId, jobId) => {
    return CandidateQueryset.assignCandidatesToRecruiter(seekerIds, recruiterId, jobId);
};

exports.MakeDecisionToCandidates = async (seekerIds, jobId, decision) => {
    return CandidateQueryset.makeDecisionToCandidates(seekerIds, jobId, decision);
};

exports.unassignCandidatesFromRecruiter = async (seekerIds, jobId) => {
    return CandidateQueryset.unassignCandidatesFromRecruiter(seekerIds, jobId);
};