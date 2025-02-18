const ReadPool = require('../../../config/db').getReadPool;
const WritePool = require('../../../config/db').getWritePool;
const constants = require('../../../config/config');

class CandidateModel {

    static async getCandidatesForJob(jobId, filters, sortByRecommendation, limit, offset, sortByAssessmentScore) {
        let params = [jobId];
        let query;
        let index = 0;
        if (filters.status == constants.candidate_status_pending || !filters.status) {
            index+=2;
            query = ` 
                SELECT 
                    job_seeker.id as seeker_id,
                    job_seeker.name as job_seeker_name,
                    rp.name as phase_name,
                    candidates.date_applied as date_applied,
                    job_seeker.country as candidate_country,
                    job_seeker.city as candidate_city,
                    recruiter.name as recruiter_name,
                    CASE 
                        WHEN 
                            rt.name = 'assessment' AND candidates.phase_deadline < NOW() 
                        THEN 
                            COALESCE(assessment.score, 0::smallint) 
                        ELSE 
                            assessment.score 
                    END AS score, assessment.total_score as total_score,
                    CASE WHEN rt.name = 'cv screening' THEN DENSE_RANK() OVER (ORDER BY similarity_score DESC) ELSE NULL END AS rank
                FROM (
                    SELECT 
                        date_applied, 
                        seeker_id, phase, 
                        recruitment_process_id,
                        recruiter_id,
                        similarity_score, job_id,
                        phase_deadline
                    FROM candidates
                    WHERE candidates.job_id = $1
                ) AS candidates
                JOIN job_seeker ON candidates.seeker_id = job_seeker.id
                JOIN recruitment_phase rp ON 
                    candidates.phase = rp.phase_num AND 
                    candidates.recruitment_process_id = rp.recruitment_process_id
                JOIN phase_type rt ON rp.type = rt.id
                LEFT JOIN recruiter ON candidates.recruiter_id = recruiter.id 
                LEFT JOIN assessment_score assessment ON 
                    candidates.seeker_id = assessment.seeker_id AND 
                    candidates.phase = assessment.phase_num AND 
                    candidates.job_id = assessment.job_id `;
        }
        else {
            index += 3;
            query = `
            SELECT 
                seeker_id, phase_name,
                status, date_applied,
                score, job_seeker.id as job_seeker_id,
                job_seeker.name as job_seeker_name,
                job_seeker.country as candidate_country,
                job_seeker.city as candidate_city
            FROM (
                SELECT
                job_id, seeker_id,
                phase_name,
                status, date_applied,
                score, phase_type
                FROM candidate_history
                WHERE job_id = $1 AND status = $2
            ) as candidate_history
            JOIN job_seeker ON candidate_history.seeker_id = job_seeker.id `;
            params.push(filters.status == constants.candidate_status_rejected ? false: true);
        }
        
        if(Object.keys(filters).length > 0) {
            query += `WHERE 1=1 `;
        }
        if (filters.candidateLocation) {
            query += `AND job_seeker.country = $${index} `;
            params.push(filters.candidateLocation);
            index++;
        }
        if(filters.status == constants.candidate_status_pending || !filters.status) {
            if (filters.phaseType) {
                query += `AND rp.type = $${index} `;
                params.push(filters.phaseType);
                index++;
            }
            if (sortByRecommendation == constants.desc_order) {
                query += `ORDER BY rank DESC `;
            }
            else if (sortByAssessmentScore == constants.desc_order) {
                query += `ORDER BY score DESC `;
            }
            else if (sortByRecommendation == constants.asc_order) {
                query += `ORDER BY rank ASC `;
            }
            else if (sortByAssessmentScore == constants.asc_order) {
                query += `ORDER BY score ASC `;
            }
            else {
                query += `ORDER BY candidates.seeker_id DESC `;
            }
        }
        else {
            if (filters.phaseType) {
                query += `AND candidate_history.phase_type = $${index} `;
                params.push(filters.phaseType);
                index++;
            }
            query += `ORDER BY date_applied DESC `;
        }
        query += `LIMIT $${index} OFFSET $${index + 1};`;
        params.push(limit);
        params.push(offset);
        let results = await ReadPool().query(query, params);

        return results.rows;
    }

    static async getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, limit, offset) {
        let params = [recruiterId];
        let query = `
        SELECT
         job_seeker.id as job_seeker_id,
         job_seeker.name as job_seeker_name,
         job.title as job_title, 
         rp.name as phase_name `;
        if (!simplified) {
            query += `,
            candidates.date_applied as date_applied,
            job_seeker.country as candidate_country,
            job_seeker.city as candidate_city,
            job.country as job_country,
            job.city as job_city,
            CASE 
                WHEN 
                    rt.name = 'assessment' AND candidates.phase_deadline < NOW() 
                THEN 
                    COALESCE(assessment.score, 0::smallint) 
                ELSE 
                    assessment.score 
            END AS score, assessment.total_score as total_score `;
        }
        query += `
        FROM (
            SELECT 
                date_applied, 
                seeker_id, 
                job_id, phase, 
                recruitment_process_id, phase_deadline
            FROM candidates
            WHERE recruiter_id = $1
        ) AS candidates
        JOIN job_seeker ON candidates.seeker_id = job_seeker.id
        JOIN job ON candidates.job_id = job.id
        JOIN recruitment_phase rp ON candidates.phase = rp.phase_num AND candidates.recruitment_process_id = rp.recruitment_process_id `;
        if (!simplified) {
            query += `
            JOIN phase_type rt ON rp.type = rt.id
            LEFT JOIN assessment_score assessment ON
                candidates.seeker_id = assessment.seeker_id AND
                candidates.phase = assessment.phase_num AND
                candidates.job_id = assessment.job_id `;
        }

        if (Object.keys(filters).length > 0) {
            query += `WHERE 1=1 `;
        }
        let index = 2;
        if (filters.jobTitle) {
            query += `AND job.title = $${index} `
            params.push(filters.jobTitle);
            index++;
        }
        if (filters.phaseType) {
            query += `AND rp.type = $${index} `
            params.push(filters.phaseType);
            index++;
        }
        if (filters.candidateLocation) {
            query += `AND job_seeker.country = $${index} `
            params.push(filters.candidateLocation);
            index++;
        }
        if (sortBy == constants.asc_order) {
            query += `ORDER BY candidates.date_applied ASC `
        }
        else {
            query += `ORDER BY candidates.date_applied DESC `
        }
        query += `LIMIT $${index} OFFSET $${index + 1};`;
        params.push(limit);
        params.push(offset);
        let results = await ReadPool().query(query, params);

        return results.rows;
    }

    static async assignCandidatesToRecruiter(seekerIds, recruiterId, jobId) {
        const client = await WritePool().connect();
        try {
            await client.query('BEGIN;');
            const query = `
                UPDATE candidates
                SET recruiter_id = $1
                WHERE seeker_id = ANY($2) AND job_id = $3 AND recruiter_id IS NULL
                RETURNING seeker_id;`;
            const params = [recruiterId, seekerIds, jobId];
            let updated_candidates = (await client.query(query, params));
            
            let assigned_candidates_cnt = (await client.query(`
                SELECT assigned_candidates_cnt
                FROM recruiter
                WHERE id = $1
                FOR UPDATE;    
            `, [recruiterId])
            ).rows[0].assigned_candidates_cnt + updated_candidates.rowCount;
            
            await client.query(`
                UPDATE recruiter 
                SET assigned_candidates_cnt = $1
                WHERE id = $2;`, [assigned_candidates_cnt, recruiterId]);

            
            return {assigned_candidates_cnt: assigned_candidates_cnt, updated_candidates: updated_candidates.rows, client: client};
        } catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        }
    }

    static async makeDecisionToCandidates(seekerIds, jobId, decision) {
        const client = await WritePool().connect();
        if (decision) {
            try {
                // get each job seeker's phase number
                client.query('BEGIN;');

                let results = await client.query(`
                    SELECT 
                        rph.name as next_phase_name,
                        rp.num_of_phases as num_of_phases,
                        candidates.seeker_id as seeker_id,
                        candidates.phase as phase_num, rph.deadline as deadline,
                        rpt.name as phase_type
                    FROM (
                        SELECT 
                            phase, seeker_id,
                            recruitment_process_id
                        FROM candidates
                        WHERE seeker_id = ANY($1) AND job_id = $2
                        FOR UPDATE
                    ) AS candidates
                    JOIN recruitment_process rp ON rp.id = candidates.recruitment_process_id
                    LEFT JOIN recruitment_phase rph ON rph.recruitment_process_id = rp.id AND rph.phase_num = candidates.phase + 1
                    LEFT JOIN phase_type rpt ON rpt.id = rph.type 
                `, [seekerIds, jobId]);

                let inLastPhase = []
                results = results.rows;
                let updatedCandidates = results.map((result) => {
                    if (!result.next_phase_name) {
                        inLastPhase.push(result.seeker_id);
                        return undefined;
                    }
                    let deadline = new Date();
                    deadline.setDate(deadline.getDate() + (result.deadline || 0));
                    return {
                        deadline: result.deadline? deadline.toISOString(): undefined, 
                        seekerId: result.seeker_id, 
                        nextPhaseName: result.next_phase_name, 
                        phase_num: result.phase_num, 
                        phase_type: result.phase_type
                    };
                });
                updatedCandidates = updatedCandidates.filter((value) => value != undefined);

                if(updatedCandidates.length > 0) {
                    let validSeekerIds = updatedCandidates.map((value) => value.seekerId);
                    await client.query(`
                        UPDATE recruiter
                        SET assigned_candidates_cnt = assigned_candidates_cnt - (
                            SELECT COUNT(*) 
                            FROM candidates 
                            WHERE seeker_id = ANY($1) AND job_id = $2 AND recruiter_id = recruiter.id
                        )
                    `, [validSeekerIds, jobId]);
                    
                    let update_query = `
                    UPDATE candidates
                    SET phase = phase + 1, 
                    phase_deadline = CASE seeker_id
                            ${updatedCandidates.map(value => `WHEN ${value.seekerId} THEN ${value.deadline? `TIMESTAMP '${value.deadline}'`: `NULL::timestamp`}`).join(' ') + ' ELSE NULL::timestamp'}
                        END, 
                    recruiter_id = NULL
                    WHERE seeker_id = ANY($1) AND job_id = $2;
                    `;
                    
                    await client.query(update_query, [validSeekerIds, jobId]);
                }

                
                return {invalidCandidates: inLastPhase, updatedCandidates: updatedCandidates, client: client}
            } catch(error) {
                await client.query('ROLLBACK;');
                throw error;
            }
        }
        else if (decision == 0) {
            return this.moveCandidatesToHistory(seekerIds, jobId, decision, client);
        }
    }

    static async unassignCandidatesFromRecruiter(seekerIds, jobId) {
        const client = await WritePool().connect();
        try {
            await client.query('BEGIN;');
            let result = await client.query(`
                SELECT recruiter_id, seeker_id
                FROM candidates
                WHERE seeker_id = ANY($1) AND job_id = $2 AND recruiter_id IS NOT NULL
                FOR UPDATE;    
            `, [seekerIds, jobId]);
            
            let recruiters = result.rows.map((value) => value.recruiter_id);
            seekerIds = result.rows.map((value) => value.seeker_id);
            
            if (!result.rows.length) {
                let error = new Error();
                error.msg = 'Candidates are already not assigned';
                error.status = 400;
                throw error;
            }
            
            await client.query(`
                SELECT assigned_candidates_cnt
                FROM recruiter
                WHERE id = ANY($1)
                FOR UPDATE;    
            `, [recruiters]);

            let assigned_candidates_cnt = await client.query(`
                UPDATE recruiter
                SET assigned_candidates_cnt = assigned_candidates_cnt - (
                    SELECT COUNT(*) 
                    FROM candidates 
                    WHERE seeker_id = ANY($1) AND job_id = $2 AND recruiter_id = recruiter.id
                ) RETURNING assigned_candidates_cnt, recruiter.name as recruiter_name;
            `, [seekerIds, jobId]);
            let {assigned_candidates_count , recruiter_name} = assigned_candidates_cnt.rows[0];

            await client.query(`
                UPDATE candidates
                SET recruiter_id = NULL
                WHERE seeker_id = ANY($1) AND job_id = $2;
            `, [seekerIds, jobId]);

            
            return {assigned_candidates_cnt: assigned_candidates_count, recruiter_name: recruiter_name, seekerIds: seekerIds, client: client};
        } catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        }
    }

    static async getCompanyName(companyId) {
        let results = await ReadPool().query(`
            SELECT name
            FROM company
            WHERE id = $1;
        `, [companyId]);

        return results.rows[0].name;
    }

    static async getRecruiterName(recruiterId) {
        let results = await ReadPool().query(`
            SELECT name, company_id
            FROM recruiter
            WHERE id = $1;
        `, [recruiterId]);

        return results.rows[0];
    }

    static async getRecruitementPhases(jobId) {
        let results = await ReadPool().query(`
            SELECT JSON_OBJECT_AGG(
                    phase_num, rp.name
            ) AS phases
            FROM job
            JOIN recruitment_phase rp ON rp.recruitment_process_id = job.recruitment_process_id
            WHERE job.id = $1
        `, [jobId]);
        
        return results.rows[0].phases;
    }

    static async getCandidateLocationsForRecuriter(recruiterId){
        const results = await ReadPool().query(
            `SELECT ARRAY_AGG(DISTINCT job_seeker.country) AS "candidateLocations"
             FROM candidates
             JOIN job_seeker ON candidates.seeker_id = job_seeker.id
             WHERE recruiter_id = $1;`, [recruiterId]);

        return results.rows;
    }

    static async getCandidateLocationsForCompany(jobId){
        const results = await ReadPool().query(
            `SELECT ARRAY_AGG(DISTINCT job_seeker.country) AS "candidateLocations"
             FROM candidates
             JOIN job_seeker ON candidates.seeker_id = job_seeker.id
             WHERE job_id = $1;`, [jobId]);

        return results.rows;
    }

    static async getPhaseTypes() {
        const results = await ReadPool().query(`
            SELECT *
            FROM phase_type`);

        return results.rows;
    }

    static async moveCandidatesToHistory(seekerIds, jobId, decision, client) {
        try {
            await client.query('BEGIN;');
            // select the candidates and insert them to the histroy
            await client.query(`
                INSERT INTO 
                    candidate_history(
                        seeker_id, job_id, 
                        phase_name, company_name, 
                        job_title, country, 
                        city, remote, 
                        date_applied, score, 
                        status, phase_type, total_score,
                        template_description, placeholders_params,
                        last_status_update
                    )
                SELECT
                    candidates.seeker_id as seeker_id, candidates.job_id as job_id,
                    rp.name as phase_name,
                    company.name as company_name, job.title as job_title,
                    job.country as country, job.city as city,
                    job.remote, date_applied,
                    assessment.score as score, $3 as status, 
                    rp.type as phase_type, assessment.total_score as total_score,
                    jot.description, candidates.placeholders_params,
                    candidates.last_status_update
                FROM (
                    SELECT
                        date_applied, seeker_id, 
                        job_id, phase,
                        recruitment_process_id, template_id,
                        last_status_update, placeholders_params
                    FROM candidates
                    WHERE seeker_id = ANY($1) AND job_id = $2
                    FOR UPDATE
                ) AS candidates
                JOIN job ON candidates.job_id = job.id
                JOIN recruitment_phase rp ON 
                    candidates.phase = rp.phase_num AND 
                    candidates.recruitment_process_id = rp.recruitment_process_id
                JOIN company ON job.company_id = company.id
                LEFT JOIN job_offer_template jot ON
                    candidates.template_id = jot.id
                LEFT JOIN assessment_score assessment ON 
                    candidates.seeker_id = assessment.seeker_id AND 
                    candidates.job_id = assessment.job_id AND 
                    candidates.phase = assessment.phase_num
                ON CONFLICT (seeker_id, job_id) DO NOTHING;
            `, [seekerIds, jobId, decision]);

            await client.query(`
                UPDATE recruiter
                SET assigned_candidates_cnt = assigned_candidates_cnt - (
                    SELECT COUNT(*) 
                    FROM candidates 
                    WHERE seeker_id = ANY($1) AND job_id = $2 AND recruiter_id = recruiter.id
                )
            `, [seekerIds, jobId]);


            // delete candidates from candidates table
            let res = (await client.query(`
                DELETE FROM candidates
                WHERE seeker_id = ANY($1) AND job_id = $2
                RETURNING seeker_id as "seekerId", phase as phase_num, 0 as decision;
            `, [seekerIds, jobId])).rows;

            return {updatedCandidates: res, client: client};
        } catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        }
    }

    static async getJobTitleFilter(userId) {
        let {rows} = await ReadPool().query(`
            SELECT ARRAY_AGG(DISTINCT(title)) AS "jobTitle"
            FROM candidates
            JOIN job ON candidates.job_id = job.id
            WHERE candidates.recruiter_id = $1
        `, [userId]);
        return rows[0];
    }
}



class CandidateAPIAuthorization {
    static async jobBelongsToCompany (jobId, userId) {
        return (await ReadPool().query(`
            SELECT 1 
            FROM job
            WHERE id = $1 AND company_id = $2;
        `, [jobId, userId])).rows.length > 0;
    }

    static async candidatesBelongsToCompany (jobId, seekerIds, userId) {
        return (await ReadPool().query(`
            SELECT 1 
            FROM (
                SELECT job_id 
                FROM candidates
                WHERE job_id = $1 AND seeker_id = ANY($2)
            ) AS candidates
            JOIN job ON candidates.job_id = job.id 
            WHERE job.company_id = $3;
        `, [jobId, seekerIds, userId])).rows.length == seekerIds.length;
    }

    static async recruiterBelongsToCompany (recruiterId, companyId) {
        return (await ReadPool().query(`
            SELECT 1
            FROM recruiter
            WHERE id = $1 AND company_id = $2;
        `, [recruiterId, companyId])).rows.length > 0;
    }

    static async candidatesBelongsToRecruiterOrCompany (jobId, seekerIds, userId) {
        return (await ReadPool().query(`
            SELECT 1
            FROM (
                SELECT job_id, recruiter_id
                FROM candidates
                WHERE job_id = $1 AND seeker_id = ANY($2)
            ) AS candidates
            JOIN job ON candidates.job_id = job.id 
            WHERE job.company_id = $3 OR candidates.recruiter_id = $4;
        `, [jobId, seekerIds, userId, userId])).rows.length == seekerIds.length;
    }
}

    


module.exports = { 
    CandidateModel,
    CandidateAPIAuthorization
};