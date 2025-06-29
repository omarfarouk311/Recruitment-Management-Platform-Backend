const CandidateQueryset = require('./candidateModel').CandidateModel;
const { pagination_limit, action_types, role } = require('../../../config/config');
const { produce } = require('../../common/kafka');
const {v6: uuid} = require('uuid');

exports.getCandidatesForJob = async (jobId, filters, sortByRecommendation, page, sortByAssessmentScore) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForJob(jobId, filters, sortByRecommendation, pagination_limit, offset, sortByAssessmentScore);
};

exports.getCandidatesForRecruiter = async (recruiterId, simplified, filters, sortBy, page=1 ) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, pagination_limit, offset);
};

exports.assignCandidatesToRecruiter = async (seekerIds, recruiterId, jobId, companyId) => {
    let result;
    try {
        result = CandidateQueryset.assignCandidatesToRecruiter(seekerIds, recruiterId, jobId);
        let company = CandidateQueryset.getCompanyName(companyId);
        [result, company] = await Promise.all([result, company]);
        let logId = uuid();
        await produce({
            id: uuid(),
            action_type: action_types.assign_candidate,
            performed_by: company.name,
            created_at: new Date(),
            company_id: companyId,
            extra_data: {
                recruiterName: result.recruiterName,
                seekerIds: result.seekerNames.map((value) => value.name)
            }
        }, 'logs');

        try {
            await result.client.query('COMMIT;');
        } catch(error) {
            console.log(logId);
            if (logId)
                await produce({
                    id: logId,
                    type: 0
                }, 'logs');
            throw error
        }
        [].find
        
        return { 
            assignedCandidatesCnt: result.assigned_candidates_cnt, 
            invalidCandidates: seekerIds.filter((value) => result.updated_candidates.find((seeker) => seeker.seeker_id === value) === undefined) };
    } catch (error) {
        if (result.client) {
            await result.client.query('ROLLBACK;');
        }
        throw error;
    } finally {
        if (result.client) {
            result.client.release();
            delete result.client;
        }
    }
};

exports.MakeDecisionToCandidates = async (seekerIds, jobId, decision, userId, userRole) => {
    let result; 
    try {
        result = CandidateQueryset.makeDecisionToCandidates(seekerIds, jobId, decision);
        let performed_by = userRole === role.company? CandidateQueryset.getCompanyName(userId) : CandidateQueryset.getRecruiterName(userId);
        let recProc = await CandidateQueryset.getRecruitementPhases(jobId);
        [result, performed_by, recProc] = await Promise.all([result, performed_by, recProc]);
        
        let logId;
        if (result.updatedCandidates.length) {
            logId = uuid();
            let promises = [];
            promises.push(produce({
                id: logId,
                action_type: action_types.move_candidate,
                performed_by: performed_by.name,
                created_at: new Date(),
                company_id: userRole === role.company? userId: performed_by.company_id,
                extra_data: {
                    job_seekers_data: result.updatedCandidates.map((value) => {
                        return {
                            seekerId: value.seekerId,
                            from: recProc[value.phase_num],
                            to: decision !== 0? recProc[`${value.phase_num + 1}`]: "Rejected",
                        }
                    }),
                },
            }, 'logs'));

            promises.push(produce(result.updatedCandidates.map((value) => {
                return {
                    companyId: userRole == role.company? userId: performed_by.company_id,
                    jobId: jobId,
                    jobSeeker: value.seekerId,
                    rejected: !decision,
                    newPhaseName: value.decision !== 0? recProc[`${value.phase_num + 1}`]: "Rejected",
                    interview: value.phase_type === 'interview',
                    deadline: value.deadline,
                    type: 1
                }
            }), 'emails'));

            await Promise.all(promises);
        }

        try {
            await result.client.query('COMMIT;');
        } catch(error) {
            console.log(logId);
            if (logId)
                await produce({
                    id: logId,
                    type: 0
                }, 'logs');
            throw error
        }
        delete result.decision;
        result.updatedCandidates = result.updatedCandidates.map((value) => {
            delete value.phase_type;
            delete value.phase_num;
            return value;
        });
        return result;
    } catch (error) {
        if (result.client) {
            await result.client.query('ROLLBACK;');
        }
        throw error;
    } finally {
        if (result.client) {
            result.client.release();
            delete result.client;
        }
    }
};

exports.unassignCandidatesFromRecruiter = async (seekerIds, jobId, companyId) => {
    let result;
    try {
        result = CandidateQueryset.unassignCandidatesFromRecruiter(seekerIds, jobId);
        let company = CandidateQueryset.getCompanyName(companyId);
        [result, company] = await Promise.all([result, company]);
        const logId = uuid();
        await produce({
            id: logId,
            action_type: action_types.unassign_candidate,
            performed_by: company.name,
            created_at: new Date(),
            company_id: companyId,
            extra_data: {
                seekerIds: result.seekerIds,
                recruiterName: result.recruiterName
            }
        }, 'logs');
        try {
            await result.client.query('COMMIT;');
        } catch(error) {
            await produce({
                id: logId,
                type: 0
            }, 'logs');
        }
        
        delete result.seekerIds;
        return result;
    } catch(error) {
        if (result.client) {
            await result.client.query('ROLLBACK;');
        }
        throw error;
    } finally {
        if (result.client) {
            result.client.release();
            delete result.client;
        }
    }
};

exports.getCandidateLocationsForRecruiter = async (recruiterId) => {
    return await CandidateQueryset.getCandidateLocationsForRecuriter(recruiterId);
};

exports.getCandidateLocationsForJob = async (jobId) => {
    return await CandidateQueryset.getCandidatesForJob(jobId);
};

exports.getPhaseTypes = async () => {
    return await CandidateQueryset.getPhaseTypes();
};

exports.getJobTitleFilter = async (userId) => {
    return await CandidateQueryset.getJobTitleFilter(userId);
}