const ReadPool = require('../../../config/db').getReadPool;
const WritePool = require('../../../config/db').getWritePool;
const constants = require('../../../config/config');

class CandidateModel {

    static async getCandidatesForJob(jobId, filters, sortBy, limit, offset) {
        params = [jobId];
        query = `
        SELECT 
            job_seeker.id as job_seeker_id,
            job_seeker.name as job_seeker_name,
            rp.name as phase_name 
            candidates.date_applied as date_applied,
            job_seeker.country as candidate_country,
            job_seeker.city as candidate_city,
            recruiter.name as recruiter_name,
            DENSE_RANK() OVER (ORDER BY similarity_score DESC) AS rank
        FROM (
            SELECT 
                date_applied, 
                seeker_id, phase, 
                recruitment_process_id,
                recruiter_id,
                similarity_score
            FROM candidates
            WHERE candidates.job_id = $1
        ) AS candidates
        JOIN job_seeker ON candidates.seeker_id = job_seeker.id
        JOIN recruitment_phase rp ON candidates.phase = rp.phase_num AND candidates.recruitment_process_id = rp.recruitment_process_id
        JOIN recruiter ON candidates.recruiter_id = recruiter.id `;
        index = 2;
        if(Object.keys(filters).length > 0) {
            query += `WHERE 1=1 `;
        }
        if (filters.candidateLocation) {
            query += `AND job_seeker.country = $${index} `;
            params.push(filters.candidateLocation);
            index++;
        }
        if (filters.phaseType) {
            query += `AND pt.type = $${index} `;
            params.push(filters.phaseType);
            index++;
        }
        if (filters.status) {
            query += `AND candidates.status = $${index} `;
            params.push(filters.status);
            index++;
        }
        if (sortBy === constants.asc_order) {
            query += `ORDER BY rank ASC `;
        }
        else {
            query += `ORDER BY rank DESC `;
        }
        query += `LIMIT $${index} OFFSET $${index + 1};`;
        params.push(limit);
        params.push(offset);
        results = ReadPool().query(query, params);

        return results.rows;
    }

    static async getCandidatesForRecruiter(recruiterId, simplified, filters, sortBy, limit, offset) {
        params = [recruiterId];
        query = `
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
            job.coutry as job_country,
            job.city as job_city `;
        }
        query += `
        FROM (
            SELECT 
                date_applied, 
                seeker_id, 
                job_id, phase, 
                recruitment_process_id
            WHERE recruiter_id = $1
        ) AS candidates
        JOIN job_seeker ON candidates.seeker_id = job_seeker.id
        JOIN job ON candidates.job_id = job.id
        JOIN recruitment_phase rp ON candidates.phase = rp.phase_num AND candidates.recruitment_process_id = rp.recruitment_process_id `;
        if (Object.keys(filters).length > 0) {
            query += `WHERE 1=1 `;
        }
        index = 2;
        if (filters.jobTitle) {
            query += `AND job.title = $${index} `
            params.push(filters.jobTitle);
            index++;
        }
        if (filters.phaseType) {
            query += `AND pt.type = $${index} `
            params.push(filters.phaseType);
            index++;
        }
        if (filters.candidateLocation) {
            query += `AND job_seeker.country = $${index} `
            params.push(filters.candidateLocation);
            index++;
        }
        if (sortBy === constants.asc_order) {
            query += `ORDER BY candidates.date_applied ASC `
        }
        else {
            query += `ORDER BY candidates.date_applied DESC `
        }
        query += `LIMIT $${index} OFFSET $${index + 1};`;
        params.push(limit);
        params.push(offset);
        results = ReadPool().query(query, params);

        return results.rows;
    }

    static async assignCandidatesToRecruiter(seekerId, recruiterId, jobId) {
        const client = await WritePool().connect();
        try {
            await client.query('BEGIN;');
            const query = `
                UPDATE candidates
                SET recruiter_id = $1
                WHERE seeker_id in $2 AND job_id = $3;`;
            const params = [recruiterId, seekerId, jobId];
            await client.query(query, params);

            assigned_candidates_cnt = (await client.query(`
                SELECT assigned_candidates_cnt
                FROM recruiter
                WHERE id = $1
                FOR UPDATE;    
            `, [recruiterId])
            ).rows[0].assigned_candidates_cnt + 1;

            await client.query(`
                UPDATE recruiter 
                SET assigned_candidates_cnt = $1
                WHERE id = $2;`, [assign, recruiterId]);

            await client.query('COMMIT;');
        } catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        
        } finally {
            client.release();
        }
    }

    static async makeDecisionToCandidates(seekerIds, jobId, decision) {
        if (decision == 1) {
            try {
                // get each job seeker's phase number
                const client = await WritePool().connect();
                client.query('BEGIN;');

                results = await client.query(`
                    SELECT 
                        rph.name as next_phase_name,
                        rp.num_of_phases as num_of_phases,
                        candidates.seeker_id as seeker_id,
                        candidate.phase as phase_num
                    FROM (
                        SELECT 
                            phase, seeker_id
                        FROM candidates
                        WHERE seeker_id = ANY($1) AND job_id = $2
                        FOR UPDATE
                    ) AS candidates
                    JOIN recruitment_process rp ON rp.id = candidates.recruitment_process_id
                    JOIN recruitment_phase rph ON rph.recruitment_process_id = rp.id AND rph.phase_num = candidates.phase + 1
                `, [seekerIds, jobId]);

                inLastPhase = []
                results = results.rows;
                results = results.map((result) => {
                    if (result.phase_num >= result.num_of_phases) {
                        inLastPhase.push(result.seeker_id);
                    }
                    return {seeker_id: result.seeker_id, next_phase_name: result.next_phase_name};
                });

                update_query = `
                    UPDATE candidates
                    SET phase = phase + 1
                    WHERE id = ANY($1) AND job_id = $2;
                `
                await client.query(update_query, [seekerIds, jobId]);

                await client.query('COMMIT;');
                return {invalidCandidates: inLastPhase, updatedCandidates: results}
            } catch(error) {
                await client.query('ROLLBACK;');
                throw error;
            } finally {
                client.release();
            }
        }
        else if (decision == 0) {
            const client = await WritePool().connect();
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
                            status
                        )
                    SELECT
                        candidates.seeker_id as seeker_id, candidates.job_id as job_id,
                        rp.name as phase_name,
                        company.name as company_name, job.title as job_title,
                        job.country as country, job.city as city,
                        job.remote, date_applied,
                        assessment.score as score, 
                        false
                    FROM (
                        SELECT
                            date_applied, seeker_id, 
                            job_id, phase,
                            recruitment_process_id
                        FROM candidates
                        WHERE seeker_id = ANY($1) AND job_id = $2
                        FOR UPDATE
                    ) AS candidates
                    JOIN job ON candidates.job_id = job.id
                    JOIN recruitment_phase rp ON candidates.phase = rp.phase_num AND candidates.recruitment_process_id = rp.recruitment_process_id
                    JOIN company ON job.company_id = company.id
                    JOIN assessment_score assessment ON candidates.seeker_id = assessment.seeker_id AND candidates.job_id = assessment.job_id AND candidates.phase = assessment.phase_num;
                `, [seekerIds, jobId]);

                // delete candidates from candidates table
                await client.query(`
                    DELETE FROM candidates
                    WHERE seeker_id = ANY($1) AND job_id = $2;
                `, [seekerIds, jobId]);

                await client.query('COMMIT;');

            } catch (error) {
                await client.query('ROLLBACK;');
                throw error;
            } finally {
                client.release();
            }
        }
    }

    static async unassignCandidatesFromRecruiter(seekerId, jobId) {
        const client = await WritePool().connect();
        try {
            await client.query('BEGIN;');
            result = await client.query(`
                SELECT recruiter_id
                FROM candidates
                WHERE seeker_id = $1 AND job_id = $2
                FOR UPDATE;    
            `);

            if (!result.rows.length) {
                error = new Error();
                error.msg = 'Candidate is already not assigned';
                error.status = 400;
                throw error;
            }
            
            await client.query(`
                SELECT assigned_candidates_cnt
                FROM recruiter
                WHERE id = $1
                FOR UPDATE;    
            `, [result.rows[0].recruiter_id]);
            await client.query(`
                UPDATE recruiter
                SET assigned_candidates_cnt = assigned_candidates_cnt - 1
                WHERE id = $1;`, [result.rows[0].recruiter_id]);

            await client.query(`
                UPDATE candidates
                SET recruiter_id = NULL
                WHERE seeker_id = $1 AND job_id = $2;
            `, [seekerId, jobId]);

            await client.query('COMMIT;');
        } catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        } finally {
            client.release();
        }
    }
}


class CandidateAPIAuthorization {
    static async jobBelongsToCompany (jobId, userId) {
        return (await ReadPool().query(`
            SELECT 1 
            FROM jobs 
            WHERE id = $1 AND company_id = $2;
        `, [jobId, userId])).rows.length > 0;
    }

    static async candidateBelongsToCompany (jobId, seekerId, userId) {
        return (await ReadPool().query(`
            SELECT 1 
            FROM (
                SELECT job_id 
                FROM candidates
                WHERE job_id = $1 AND seeker_id = $2
            ) AS candidates
            JOIN jobs ON candidates.job_id = jobs.id 
            WHERE jobs.company_id = $3;
        `, [jobId, seekerId, userId])).rows.length > 0;
    }

    static async recruiterBelongsToCompany (recruiterId, companyId) {
        return (await ReadPool().query(`
            SELECT 1
            FROM recruiter
            WHERE id = $1 AND company_id = $2;
        `, [recruiterId, companyId])).rows.length > 0;
    }

    static async candidateBelongsToRecruiterOrCompany (jobId, seekerId, userId) {
        return (await ReadPool().query(`
            SELECT 1
            FROM (
                SELECT job_id, recruiter_id
                FROM candidates
                WHERE job_id = $1 AND seeker_id = $2
            ) AS candidates
            JOIN jobs ON candidates.job_id = jobs.id 
            WHERE jobs.company_id = $3 OR candidates.recruiter_id = $4;
        `, [jobId, seekerId, userId, userId])).rows.length > 0;
    }
}

module.exports = { 
    CandidateModel,
    CandidateAPIAuthorization
};