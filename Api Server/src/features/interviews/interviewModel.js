const Pool = require('../../../config/db')
const { pagination_limit, asc_order, desc_order } = require('../../../config/config')

class interview {

    static async getRecruiterInterviewsData(id, page, title, sort) {
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
}

module.exports = interview;