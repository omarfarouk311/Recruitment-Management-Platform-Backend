const Pool = require('../../../config/db')
const Kafka = require('../../common/kafka')
const { asc_order, desc_order, role } = require('../../../config/config')
const { v6: uuid } = require('uuid');



class jobModel {

    static async createJob(client, companyId, jobData) {
        let index = 1;

        try {
            const doesRecruitmentExist = `
            SELECT 1 FROM recruitment_process WHERE id = $1 AND company_id = $2;
        `;
            const { rowCount } = await client.query(doesRecruitmentExist, [jobData.processId, companyId]);

            if (rowCount === 0) {
                const err = new Error('Invalid recruitment process ID');
                err.msg = 'Recruitment process ID is not associated with the company';
                err.status = 403;
                throw err;
            }

            const date = new Date();
            const query = `
            INSERT INTO job (title, description, created_at, recruitment_process_id, company_id, industry_id, country, city, remote, applied_cnt, closed, applied_cnt_limit)
            VALUES ($${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})
            RETURNING id;
        `;
            const values = [
                jobData.jobTitle, jobData.jobDescription, date, jobData.processId,
                companyId, jobData.industryId, jobData.country, jobData.city,
                Boolean(jobData.remote), 0, Boolean(0), jobData.appliedCntLimit
            ];
            const { rows } = await client.query(query, values);
            const jobId = rows[0].id;

            for (const skill of jobData.skills) {
                const query2 = `INSERT INTO job_skill (job_id, skill_id, importance) VALUES ($1, $2, $3)`;
                const values2 = [jobId, skill.skillId, skill.importance];
                await client.query(query2, values2);
            }

            return { message: 'Job added successfully', jobId };
        } catch (err) {
            console.error('Error in createJob:', err);
            throw err;
        }
    }

    static async getAllCompanyJobs(companyId, filters) {
        let client = Pool.getReadPool();
        try {
            let index = 1;
            let query = `SELECT id, title, country, city, CURRENT_DATE - created_at as days_ago
                        FROM job
                        WHERE company_id = $${index++}`;

            const { title, sort } = filters;
            const values = [companyId];
            if (title) {
                query += ` AND title = $${index++}`;
                values.push(title);
            }
            if (sort == asc_order) {
                query += ` ORDER BY created_at;`;
            } else if (sort == desc_order) {
                query += ` ORDER BY created_at DESC;`;
            } else {
                query += ` ORDER BY id;`
            }
            const { rows } = await client.query(query, values);
            return rows;
        } catch (err) {
            console.log('Error in getAll Jobs')
            throw err;
        }
    }

    static async getJobDetailsById(jobId, userId, userRole) {
        let client = Pool.getReadPool();
        try {
            const jobDetailsQuery = `
                        SELECT j.description as job_description,
                        j.remote as remote,
                        j.applied_cnt as applied_cnt,
                        j.closed as closed,

                        c.name as company_name,
                        c.founded_in as founded_in,
                        c.overview as overview,
                        c.size as company_size,
                        c.type as type ,

                        r.title as review_title,
                        r.description as review_description,
                        r.rating as review_rating,
                        r.created_at as review_created_at

                        FROM (SELECT title, description, created_at, company_id, industry_id, country, city, remote,
                                applied_cnt, closed
                                FROM job WHERE id = $1
                                AND closed = $2
                            ) as j
                        JOIN company c
                        ON j.company_id = c.id
                        LEFT JOIN reviews r
                        ON c.id = r.company_id
                        JOIN industry i
                        ON i.id = j.industry_id;
                `;      

            const jobValues = [jobId, false];
            const jobRes = await client.query(jobDetailsQuery, jobValues);

            if (jobRes.rows.length === 0) {
                const err = new Error('Job id is not in database');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }

            let hasReported = false, hasApplied = false, skillMaches = 0;

            if (userRole === role.jobSeeker) {
                const statusQuery = `
            SELECT 
                EXISTS(SELECT 1 FROM report WHERE job_id = $1 AND creator_id = $2 limit 1) AS has_reported,
                EXISTS(SELECT 1 FROM candidates WHERE seeker_id = $2 AND job_id = $1 limit 1) AS has_applied,
                EXISTS(SELECT 1 FROM candidate_history WHERE seeker_id = $2 AND job_id = $1 limit 1) AS has_applied_history;
        `;

                // Run in parallel using Promise.all
                const [statusRes] = await Promise.all([
                    client.query(statusQuery, [jobId, userId])
                ]);

                const status = statusRes.rows[0];
                hasReported = status.has_reported;
                hasApplied = status.has_applied || status.has_applied_history;
                skillMaches = await this.getSkillMatches(jobId, userId);
            }

            return userRole === role.jobSeeker
                ? { jobDetails: jobRes.rows[0], hasReported, hasApplied, skillMaches }
                : { jobDetails: jobRes.rows[0] };

        } catch (err) {
            console.log('Error in getJobById');
            throw err;
        }

    }

    static async closeJobById(client, companyId, jobId) {
        try {
            const query = `UPDATE job SET closed = true WHERE id = $1;`
            await client.query(query, [jobId]);
            return;
        } catch (err) {
            console.error('Error in deleteJobById:', err);
            throw err;
        }
    }


    static async updateJobById(client, companyId, jobId, jobData) {
        try {
            const date = new Date();
            let index = 1;

            // Check if recruitment process exists
            const doesRecruitmentExist = `SELECT 1 FROM recruitment_process WHERE id = $1 AND company_id = $2;`;
            const { rowCount } = await client.query(doesRecruitmentExist, [jobData.processId, companyId]);
            if (rowCount === 0) {
                const err = new Error('Invalid recruitment process ID');
                err.msg = 'Recruitment process ID is not associated with the company';
                err.status = 403;
                throw err;
            }

            // Update job details
            const query = `
                        UPDATE job SET title = $${index++}, description = $${index++}, created_at = $${index++}, 
                          recruitment_process_id = $${index++}, company_id = $${index++}, industry_id = $${index++}, 
                          country = $${index++}, city = $${index++}, remote = $${index++}, applied_cnt = $${index++}, 
                          closed = $${index++}, applied_cnt_limit = $${index++}
                        WHERE id = $${index++};
        `;
            const values = [
                jobData.jobTitle, jobData.jobDescription, date, jobData.processId, companyId, jobData.industryId,
                jobData.country, jobData.city, Boolean(jobData.remote), 0, Boolean(0), jobData.appliedCntLimit, jobId
            ];
            await client.query(query, values);

            // Delete old job skills
            await client.query(`DELETE FROM job_skill WHERE job_id = $1;`, [jobId]);

            // Insert new job skills
            index = 1;
            for (let i = 0; i < jobData.skills.length; i++) {
                const query3 = `INSERT INTO job_skill (job_id, skill_id, importance) 
                            VALUES ($${index}, $${index + 1}, $${index + 2})`;
                const values3 = [jobId, jobData.skills[i].skillId, jobData.skills[i].importance];
                await client.query(query3, values3);
            }

            return;
        } catch (err) {
            console.error('Error in updateJobById:', err);
            throw err;
        }
    }


    static async getJobDataForEditing(jobId) {
        let client = await Pool.getReadPool().connect();
        try {
            await client.query('BEGIN');
            const isExistQuery = `select 1 FROM job WHERE id = $1 ;`
            const { rowCount } = await client.query(isExistQuery, [jobId]);
            if (rowCount == 0) {
                const err = new Error('Job id is not in database');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }
            const query = `
                        SELECT j.title as job_title,
                        j.description as job_description,
                        j.applied_cnt_limit as applied_cnt_limit,
                        j.closed as closed,             
                        j.country as country,
                        j.city as city,
                        j.remote as remote,

                        i.name as industry_name,

                        rp.name as recruitment_process_name
                        FROM (
                                SELECT id, title, description, recruitment_process_id, industry_id, country, city, remote, applied_cnt_limit, closed
                                FROM Job
                                WHERE id = $1
                            ) as j
                        JOIN Industry i
                        ON j.industry_id = i.id
                        LEFT JOIN Recruitment_Process rp
                        ON rp.id = j.recruitment_process_id;
                     `

            const values = [jobId];
            let jobData = await client.query(query, values);
            jobData = jobData.rows;

            const query2 = `
                            SELECT s.name as skill_name,
                            js.importance as skill_importance,
                            js.skill_id as skill_id
                            FROM (
                                    SELECT job_id, skill_id, importance
                                    FROM Job_Skill
                                    WHERE job_id = $1
                                ) as js
                            JOIN Skills s
                            ON s.id = js.skill_id
                        `
            let skillsData = await client.query(query2, values);
            skillsData = skillsData.rows
            const returnedObject = { jobData, skillsData }
            return returnedObject;
        } catch (err) {
            console.log('Error in getJobDataForEditing')
            await client.query('ROLLBACK')
            throw err;
        } finally {
            client.release();
        }

    }


    static async getCompanyName(companyId) {
        let client = Pool.getReadPool();
        try {
            const query = `SELECT name FROM company WHERE id = $1;`
            const values = [companyId];
            const { rows } = await client.query(query, values);
            return rows[0].name;
        } catch (err) {
            throw err;
        }
    }

    // for Authorization //
    static async getCompanyIdOfJob(jobId) {
        let client = Pool.getReadPool();
        try {
            const isExistQuery = `select 1 FROM job WHERE id = $1 ;`
            const { rowCount } = await client.query(isExistQuery, [jobId]);
            if (rowCount == 0) {
                const err = new Error('Job id is not in database');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }
            const query = `SELECT company_id FROM job WHERE id = $1;`
            const values = [jobId];
            const { rows } = await client.query(query, values);
            return rows[0].company_id;
        } catch (err) {
            throw err;
        }
    }


    static async getSimilarJobs(jobId) {
        let client = Pool.getReadPool();
        try {
            const query = `
                            SELECT c.name as companyName,
                            c.rating as companyRating,
                            j.id as jobId,
                            j.title as jobTitle,
                            j.country as country,
                            j.city as city,
                            CURRENT_DATE - j.created_at as days_ago


                            FROM  ( 
                                    SELECT embedding, job_id
                                    FROM job_embedding
                                    WHERE job_id = $1
                                ) as t1
                            JOIN job_embedding t2
                            ON t1.job_id != t2.job_id
                            JOIN job j
                            ON t2.job_id = j.id
                            JOIN company c
                            ON j.company_id  = c.id
                            ORDER BY t1.embedding <=> t2.embedding
                            LIMIT 3;

                        `
            const values = [jobId];
            const { rows } = await client.query(query, values);
            return rows;
            
        } catch (err) {
            throw err;
        }
    }

    //////////// helper function

    static async getSkillMatches(jobId, seekerId) {
        let client = Pool.getReadPool();
        try {
            const query = `
                SELECT 1
                FROM (
                        SELECT skill_id
                        FROM job_skill 
                        WHERE job_id = $1    
                    ) as js
                join (
                        SELECT skill_id
                        FROM user_skills 
                        WHERE user_id = $2
                ) as us
                ON js.skill_id = us.skill_id
            `;
            const values = [jobId, seekerId];
            const { rowCount } = await client.query(query, values);
            return rowCount;
        } catch (err) {
            console.error('Error in getSkillMatches:', err);
            throw err;
        }
    }
}



module.exports = jobModel