const CandidateQueryset = require('./candidateModel').CandidateModel;
const { pagination_limit, action_types, role } = require('../../../config/config');
const { produce } = require('../../common/kafka');
const {v6: uuid} = require('uuid');

exports.getCandidatesForJob = async (jobId, filters, sortBy, page) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForJob(jobId, filters, sortBy, pagination_limit, offset);
};

exports.getCandidatesForRecruiter = async (recruiterId, simplified, filters, sortBy, page=1 ) => {
    offset = (page - 1) * pagination_limit;
    return await CandidateQueryset.getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, pagination_limit, offset);
};

exports.assignCandidatesToRecruiter = async (seekerIds, recruiterId, jobId, companyId) => {
    let result;
    try {
        result = CandidateQueryset.assignCandidatesToRecruiter(seekerIds, recruiterId, jobId);
        let companyName = CandidateQueryset.getCompanyName(companyId);
        [result, companyName] = await Promise.all([result, companyName]);
        
        await produce({
            id: uuid(),
            action_type: action_types.assign_candidate,
            perfomed_by: companyName,
            created_at: new Date(),
            companyId: companyId,
            extra_data: {
                recruiterId: recruiterId,
                seekerIds: result.updated_candidates.map((value) => value.seeker_id)
            }
        }, 'logs');
        await result.client.query('COMMIT;');
        delete result.client;
        return { assignedCandidatesCnt: result.assigned_candidates_cnt };
    } catch (error) {
        if (result.client) {
            await result.client.query('ROLLBACK;');
            delete result.client;
        }
        throw error;
    } finally {
        if (result.client)
            result.client.release();
    }
};

exports.MakeDecisionToCandidates = async (seekerIds, jobId, decision, userId, userRole) => {
    let result; 
    try {
        result = CandidateQueryset.makeDecisionToCandidates(seekerIds, jobId, decision);
        let performed_by = CandidateQueryset.getCompanyName(userId) || CandidateQueryset.getRecruiterName(userId);
        let recProc = CandidateQueryset.getRecruitementPhases(jobId);

        [result, performed_by, recProc] = await Promise.all([result, performed_by, recProc]);
        
        if (result.updatedCandidates.length) {
            let promises = [];
            promises.push(produce({
                id: uuid(),
                action_type: action_types.move_candidate,
                perfomed_by: performed_by.name,
                created_at: new Date(),
                companyId: userId,
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

        await result.client.query('COMMIT;');
        delete result.client;
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
            delete result.client;
        }
        throw error;
    } finally {
        if (result.client)
            result.client.release();
    }
};

exports.unassignCandidatesFromRecruiter = async (seekerIds, jobId, companyId) => {
    let result;
    try {
        result = CandidateQueryset.unassignCandidatesFromRecruiter(seekerIds, jobId);
        let companyName = CandidateQueryset.getCompanyName(companyId);
        [result, companyName] = await Promise.all([result, companyName]);

        await produce({
            id: uuid(),
            action_type: action_types.unassign_candidate,
            perfomed_by: companyName,
            created_at: new Date(),
            companyId: companyId,
            extra_data: {
                seekerIds: result.seekerIds,
                recruiterName: result.recruiter_name
            }
        }, 'logs');

        await result.client.query('COMMIT;');
        delete result.client;
        delete result.seekerIds;
        return result;
    } catch(error) {
        if (result.client) {
            await result.client.query('ROLLBACK;');
            delete result.client;
        }
        throw error;
    } finally {
        if (result.client)
            result.client.release();
    }
};

exports.getCandidateLocationsForRecruiter = async (recruiterId) => {
    return await CandidateQueryset.getCandidateLocationsForRecuriter(recruiterId);
};

exports.getCandidateLocationsForJob = async (jobId) => {
<<<<<<< Updated upstream
    return await CandidateQueryset.getCandidateLocationsForCompany(jobId);
=======
    return await CandidateQueryset.getCandidateLocationsForJob(jobId);
};

exports.getPhaseTypes = async () => {
    return await CandidateQueryset.getPhaseTypes();
>>>>>>> Stashed changes
};