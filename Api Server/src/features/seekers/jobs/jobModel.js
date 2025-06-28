const { getReadPool, getWritePool } = require('../../../../config/db');
const { pagination_limit, email_types: { job_closing, change_phase } } = require('../../../../config/config');

class Job {
    static getReplicaPool() {
        return getReadPool();
    }

    static getMasterPool() {
        return getWritePool();
    }

    static async getRecommendedJobs(seekerId, filters, limit = pagination_limit) {
        const values = [seekerId];
        let index = 1;
        let query =
            `
            select j.id, j.title, j.company_id as "companyId", c.name as "companyName", c.rating as "companyRating",
            j.country, j.city, j.created_at as "createdAt"
            from Recommendations r
            join job j on r.job_id = j.id
            join company c on j.company_id = c.id
            where r.seeker_id = $${index++}
            `;

        if (filters.country) {
            query += ` and j.country = $${index++}`;
            values.push(filters.country);
        }
        if (filters.city) {
            query += ` and j.city = $${index++}`;
            values.push(filters.city);
        }
        if (filters.remote) {
            query += ` and j.remote = true`;
        }
        if (filters.industry) {
            query += ` and j.industry_id = $${index++}`;
            values.push(filters.industry);
        }
        // company rating filter is from the lower bound up to (and not including) the upper bound
        if (filters.companyRating) {
            query += ` and c.rating >= $${index++}`;
            values.push(filters.companyRating);
        }
        if (filters.fromDate) {
            query += ` and j.created_at between $${index++} and $${index++}`;
            values.push(filters.fromDate, filters.toDate);
        }

        query +=
            ` 
            order by r.similarity_score desc
            limit $${index++} offset $${index++}
            `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await Job.getReplicaPool().query(query, values);
        return rows;
    }

    static async getSearchedJobs(filters, limit = pagination_limit) {
        const values = [filters.word];
        let index = 2;
        let query =
            `
            select j.id, j.title, j.company_id as "companyId", c.name as "companyName", c.rating as "companyRating",
            j.country, j.city, j.created_at as "createdAt"
            from job j
            join company c on j.company_id = c.id
            where similarity($1, j.title) >= 0.2 and closed = false
            `;

        if (filters.country) {
            query += ` and j.country = $${index++}`;
            values.push(filters.country);
        }
        if (filters.city) {
            query += ` and j.city = $${index++}`;
            values.push(filters.city);
        }
        if (filters.remote) {
            query += ` and j.remote = true`;
        }
        if (filters.industry) {
            query += ` and j.industry_id = $${index++}`;
            values.push(filters.industry);
        }
        if (filters.companyRating) {
            query += ` and c.rating >= $${index++}`;
            values.push(filters.companyRating);
        }
        if (filters.fromDate) {
            query += ` and j.created_at between $${index++} and $${index++}`;
            values.push(filters.fromDate, filters.toDate);
        }

        query +=
            ` 
            order by similarity($1, j.title) desc
            limit $${index++} offset $${index++}
            `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await Job.getReplicaPool().query(query, values);
        return rows;
    }

    static async apply(seekerId, cvId, jobId, produce) {
        let values = [];
        const client = await Job.getMasterPool().connect();

        try {
            await client.query('begin');

            const checkCV =
                `
                select user_id as "userId"
                from CV
                where id = $1
                `;
            values = [cvId];
            const { rows: cvData } = await client.query(checkCV, values);

            // check if the CV wasn't found
            if (!cvData.length) {
                const err = new Error("applicant's CV not found while trying to apply to a job");
                err.msg = 'CV not found';
                err.status = 404;
                throw err;
            }

            // ensure that the provided CV belongs to the seeker
            const [{ userId }] = cvData;
            if (userId !== seekerId) {
                const err = new Error("applicant's CV doesn't belong to him while trying to apply to a job");
                err.msg = 'Invalid CV id';
                err.status = 400;
                throw err;
            }

            // check if the job is closed
            // obtain exclusive lock on the row to apply serializable isolation level with pessimistic locking
            const checkLimit =
                `
                select c.id as "companyId", j.applied_cnt as "appliedCount", j.applied_cnt_limit as "appliedLimit", closed
                from Job j
                join company c on j.company_id = c.id
                where j.id = $1
                for update
                `;
            values = [jobId];
            const { rows: jobData } = await client.query(checkLimit, values);

            // check if the job wasn't found
            if (!jobData.length) {
                const err = new Error('job not found while trying to apply to it');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }

            // ensure that the seeker get denied if the job is closed
            const [{ appliedCount, appliedLimit, companyId, closed }] = jobData;
            if (closed) {
                const err = new Error('job is closed while trying to apply to it');
                err.msg = 'Job is closed';
                err.status = 400;
                throw err;
            }

            // get the similarity score and if the job wasn't recommended calculate it
            let similarityScore;
            const getSimilarity =
                `
                select similarity_score as "similarityScore"
                from Recommendations
                where seeker_id = $1 and job_id = $2
                `;
            values = [seekerId, jobId];
            const { rows: similarityData } = await client.query(getSimilarity, values);

            if (!similarityData.length) {
                // cosine similarity with pg_vector
                const calculateScore =
                    `
                    select 1 - (
                    (select j.embedding
                    from Job_Embedding j
                    where j.job_id = $1) 
                    <=> 
                    (select s.embedding
                    from Job_Seeker_Embeddings s
                    where s.seeker_id = $2)) as "similarityScore"
                    `;
                values = [jobId, seekerId];
                const { rows: scoreData } = await client.query(calculateScore, values);
                similarityScore = scoreData[0].similarityScore
            }
            else {
                similarityScore = similarityData[0].similarityScore;
            }
            // add the seeker to the applicants of the job
            const now = new Date();
            const insertCandidate =
                `
                insert into Candidates
                (seeker_id, phase, recruiter_id, job_id, date_applied, last_status_update, similarity_score, cv_id, phase_deadline, template_id, placeholders_params, recruitment_process_id, assessment_deadline, submited, interview_link)
                select $1, 1, NULL, $2, $3::timestamp, $3, $4, $5, $3 + (r.deadline * INTERVAL '1 day'), NULL, NULL, j.recruitment_process_id, NULL, false, NULL
                from Job j
                join Recruitment_Phase r on j.recruitment_process_id = r.recruitment_process_id and r.phase_num = 1
                where j.id = $2
                returning phase_deadline
                `;
            values = [seekerId, jobId, now, similarityScore, cvId];
            const { rows: [{ phase_deadline: deadline }] } = await client.query(insertCandidate, values);

            // update applicants count
            // close the job if the limit is reached and send an email to the company
            const updatedAppliedCount = appliedCount + 1;
            const updateJob =
                `
                update Job
                set applied_cnt = $1 ${updatedAppliedCount === appliedLimit ? ', closed = true' : ''}
                where id = $2
                `;
            values = [updatedAppliedCount, jobId];
            await client.query(updateJob, values);

            // Email data to notify the seeker that he has been progressed to the first phase
            let seekerEmailData = {
                type: change_phase,
                jobId,
                jobSeeker: seekerId,
                companyId,
                rejected: false,
                deadline,
                phaseNum: 1,
            };

            let companyEmailData;
            if (updatedAppliedCount === appliedLimit) {
                // stop recommending this job
                const removeJobFromRecommendations =
                    `
                    delete from Recommendations
                    where job_id = $1
                    `;
                values = [jobId];
                await client.query(removeJobFromRecommendations, values);

                // Email data to notify the company that the job has been closed
                companyEmailData = {
                    type: job_closing,
                    jobId,
                    companyId
                };
            }

            await produce(seekerEmailData, companyEmailData);

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback');
            if (err.code === '23505') {
                err.msg = 'The user has already applied to this job';
                err.status = 409;
            }
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async removeRecommendation(seekerId, jobId) {
        const query =
            `
            delete from Recommendations
            where seeker_id = $1 and job_id = $2
            `;
        await Job.getMasterPool().query(query, [seekerId, jobId]);
    }
}

module.exports = Job;