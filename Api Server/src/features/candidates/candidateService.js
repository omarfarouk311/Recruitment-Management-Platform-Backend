const CandidateQueryset = require('./candidateModel').CandidateModel;
const { pagination_limit, action_types } = require('../../../config/config');
const { produce } = require('../../common/kafka');
const uuid = require('uuid-with-v6').v6setup();

exports.getCandidatesForJob = async (jobId, filters, sortBy, page) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForJob(jobId, filters, sortBy, pagination_limit, offset);
};

exports.getCandidatesForRecruiter = async (recruiterId, simplified, filters, sortBy, page=1 ) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, pagination_limit, offset);
};

exports.assignCandidatesToRecruiter = async (seekerIds, recruiterId, jobId, companyId) => {
    let result = CandidateQueryset.assignCandidatesToRecruiter(seekerIds, recruiterId, jobId);
    let companyName = CandidateQueryset.getCompanyName(companyId);
    await Promise.all([result, companyName]);

    await produce({
        id: uuid(),
        action_type: action_types.assign_candidate,
        perfomed_by: companyName,
        created_at: new Date(),
        companyId: companyId,
        extra_data: {
            recruiterId: recruiterId,
            seekerIds: result.updated_candidates
        }
    }, 'logs');
    return { assigned_candidates_cnt: result.assigned_candidates_cnt };
};

exports.MakeDecisionToCandidates = async (seekerIds, jobId, decision, userId) => {
    let result = CandidateQueryset.makeDecisionToCandidates(seekerIds, jobId, decision);
    let performed_by = CandidateQueryset.getCompanyName(userId) || await CandidateQueryset.getRecruiterName(userId);
    let recProc = CandidateQueryset.getRecruitementPhases(jobId);

    await Promise.all([result, performed_by, recProc]);

    await produce({
        id: uuid(),
        action_type: action_types.move_candidate,
        perfomed_by: performed_by,
        created_at: new Date(),
        companyId: userId,
        extra_data: {
            job_seekers_data: result.map((value) => {
                return {
                    seekerId: value.seekerId,
                    from: recProc[value.phase_num],
                    to: value.decision !== 0? recProc[value.phase_num + 1]: "Rejected",
                }
            }),
        },
    }, 'logs');

    delete result.decision;
    delete result.phase_num
    return result;
};

exports.unassignCandidatesFromRecruiter = async (seekerIds, jobId, companyId) => {
    let result = CandidateQueryset.unassignCandidatesFromRecruiter(seekerIds, jobId);
    let companyName = CandidateQueryset.getCompanyName(companyId);
    await Promise.all([result, companyName]);

    await produce({
        id: uuid(),
        action_type: action_types.unassign_candidate,
        perfomed_by: companyName,
        created_at: new Date(),
        companyId: companyId,
        extra_data: {
            seekerIds: result.seekerIds
        }
    }, 'logs');

    delete result.seekerIds;
};