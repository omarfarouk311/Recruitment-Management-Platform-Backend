const Pool = require('../../../config/db')
const { pagination_limit, asc_order, desc_order } = require('../../../config/config')





class interview {

    static async getRecruiterInterviewsData(id, page, title, sort, city, country) {
        const client = Pool.getReadPool();
        try {
            let index = 1;
            let query = `

                        SELECT job_seeker.name as user_name,
                        job.title as job_title,
                        candidates.phase_deadline as deadline,
                        job.country as location,
                        job.remote as is_remote
                        FROM (
                                SELECT seeker_id,
                                phase, job_id,
                                phase_deadline,
                                recruitment_process_id
                                FROM Candidates
                                WHERE recruiter_id = $${index++}
                            ) as candidates

                        JOIN (
                                SELECT Phase_num, 
                                recruitment_process_id
                                FROM Recruitment_Phase r
                                JOIN Phase_Type p
                                ON type = id
                                WHERE r.name = $${index++}
                            ) as phases
                        
                        ON phases.recruitment_process_id = candidates.recruitment_process_id
                        AND phases.phase_num = candidates.phase

                        JOIN Job job
                        ON job.id = candidates.job_id

                        JOIN Job_Seeker job_seeker
                        ON job_seeker.id = candidates.seeker_id
                      `
            
            const values = [id, "interview"];
            if (title) {
                query += ` WHERE job.title = $${index++}`;
                values.push(title);
            }
            if(city) {
                query += ` WHERE job.city = $${index++}`;
                values.push(city);
            }
            if (country) {
                query += ` WHERE job.country = $${index++}`;
                values.push(country);
            }
            if (sort == asc_order || !sort) {
                query += ' ORDER BY candidates.phase_deadline';
            }
            else {
                query += ' ORDER BY candidates.phase_deadline DESC';
            }
        
            if (page) {
                const offset = (page - 1) * pagination_limit;
                values.push(pagination_limit);
                values.push(offset);
                query += ` LIMIT $${index++} OFFSET $${index++}`
            }
            const { rows } = await client.query(query, values);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async getSeekerInterviewsData(id, page, sort, city, country, companyName) {
        const client = Pool.getReadPool();
        try {
            let index = 1;
            let query = `
                        SELECT rec.name as recruiterName,
                        job.title as job_title,
                        candidates.phase_deadline as deadline,
                        job.country as location,
                        comp.name as companyName
                        FROM (
                                SELECT recruiter_id,
                                phase, job_id,
                                phase_deadline,
                                recruitment_process_id
                                FROM Candidates
                                WHERE seeker_id = $${index++}
                            ) as candidates

                        JOIN (
                                SELECT Phase_num, 
                                recruitment_process_id
                                FROM Recruitment_Phase r
                                JOIN Phase_Type p
                                ON type = id
                                WHERE r.name = $${index++}
                            ) as phases
                        
                        ON phases.recruitment_process_id = candidates.recruitment_process_id
                        AND phases.phase_num = candidates.phase

                        JOIN Job job
                        ON job.id = candidates.job_id

                        JOIN Company comp
                        ON comp.id = job.company_id

                        JOIN Recruiter rec
                        ON rec.id = candidates.recruiter_id
                      `

            const values = [id, "interview"];
            if (companyName) {
                query += ` WHERE comp.name = $${index++}`;
                values.push(companyName);
            }
            if (city) {
                query += ` WHERE job.city = $${index++}`;
                values.push(city);
            }
            if (country) {
                query += ` WHERE job.country = $${index++}`;
                values.push(country);
            }
            if (sort == asc_order || !sort) {
                query += ' ORDER BY candidates.phase_deadline';
            }
            else {
                query += ' ORDER BY candidates.phase_deadline DESC';
            }

            if (page) {
                const offset = (page - 1) * pagination_limit;
                values.push(pagination_limit);
                values.push(offset);
                query += ` LIMIT $${index++} OFFSET $${index++}`
            }
            const { rows } = await client.query(query, values);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async modifyInterviewDate(jobId, seekedId, timestamp, client) {
        try {
            const query = `
                UPDATE candidates
                SET phase_deadline = $1, last_status_update = $2
                WHERE job_id = $3 AND seeker_id = $4;
            `;
            await client.query(query, [timestamp, new Date(), jobId, seekedId]);

            return;
        } catch (err) {
            throw err;
        }
    }

    

    static async getRecruiterNameAndCompanyId(recruiterId) {
        let client = Pool.getReadPool();
        try {
            const query = `SELECT name, company_id FROM recruiter WHERE id = $1;`
            const values = [recruiterId];
            const { rows } = await client.query(query, values);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }



    // for authentication

    // to check if the authenticated recruiter has access to the interview or not
    static async getRecruiterId(jobId, seekerId) {
        let client = Pool.getReadPool();
        const query = ` SELECT recruiter_id 
                        FROM candidates
                        WHERE job_id = $1 AND seeker_id = $2;
                    `
        const { rows, rowCount } = await client.query(query, [jobId, seekerId]);
        if (rowCount == 0) {
            const error = new Error('Job id and seeker id are incorrect');
            error.msg = 'Invalid job id or seeker id';
            error.status = 404;
            throw error;
        }
     
        return rows[0].recruiter_id;
    }
}

module.exports = interview;