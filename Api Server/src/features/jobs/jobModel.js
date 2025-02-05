const Pool = require('../../../config/db')
const Kafka = require('../../common/kafka')


class jobModel {

    static async createJob(companyId, jobData) {
        let client = await Pool.getWritePool().connect();
        let index = 1;
        try {
            const date = new Date();
            await client.query('BEGIN');
            const query = `
            INSERT into job (title, description, created_at, recruitment_process_id, company_id, industry_id, country, city, remote, applied_cnt, closed)
            VALUES ($${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})
            RETURNING id;
            `
            const values = [jobData.jobTitle, jobData.jobDescription, date, jobData.processId, companyId, jobData.industryId, jobData.country, jobData.city, Boolean(jobData.remote), 0, Boolean(0)]
            const { rows } = await client.query(query, values);
            const jobId = rows[0].id;
            index = 1;
            for (let i = 0; i < jobData.skills.length; i++) {
                const query2 = `INSERT INTO job_skill (job_id, skill_id, importance) 
                                VALUES ($${index}, $${index + 1}, $${index + 2})`; 
                const values2 = [jobId, jobData.skills[i].skillId, jobData.skills[i].importance];
                await client.query(query2, values2);
            }

            await client.query('COMMIT');
            const processObject = {
                "performed_by": "Company",
                "company_id": companyId,
                "extra_data": null,
                "action_type": "Jobs",
            }
            Kafka.produceLog(processObject);

            // how will the structure of data for parsing ?

            return { message: 'Job added successfully' };
            
        } catch (err) {
            await client.query('ROLLBACK');
            console.log('Error in createJob');
            throw err;            
        } finally {
            client.release()
        }
    }


    static async getAllJobs(companyId, filters) {
        let client = await Pool.getReadPool().connect();
        try {
            let index = 1;
            let query = `SELECT title, country, city, CURRENT_DATE - created_at as days_ago
                        FROM job
                        WHERE company_id = $${index++}`;
        
            const { title, sort } = filters;
            const values = [companyId];
            if (title) {
                query += ` AND title = $${index++}`;
                values.push(title);
            }
            if (sort == 0) {
                query += ` ORDER BY created_at;`;
            } else if (sort == 1) {
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

    static async getJobById(jobId) {
        let client = await Pool.getReadPool().connect();
        try {
            const isExistQuery = `select 1 FROM job WHERE id = $1 ;`
            const { rowCount } = await client.query(isExistQuery, [jobId]);
            if (rowCount == 0) {
                const err = new Error('Job id is not in database');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }
            const query = `
                        SELECT j.title as job_title, j.description as job_description, CURRENT_DATE - j.created_at as days_ago,
                        j.country as country, j.city as city, j.remote as remote, j.applied_cnt as applied_cnt, j.closed as closed,
                        
                        c.name as company_name, c.rating as company_rating, c.founded_on as founded_on, c.overview as overview,
                        c.company_size as company_size, c.type as type ,

                        r.title as review_title, r.description as review_description, r.rating as review_rating, r.created_at as review_created_at

                        FROM (SELECT title, description, created_at, company_id, industry_id, country, city, remote,
                                applied_cnt, closed
                                FROM job WHERE id = $1
                            ) as j
                        JOIN company c
                        ON j.company_id = c.id
                        LEFT JOIN reviews r
                        ON c.id = r.company_id
                        JOIN industry i
                        ON i.id = j.industry_id;
                     `
            const values = [jobId];
            const { rows } = await client.query(query, values);
            return rows[0];
        } catch (err) {
            console.log('Error in getJobById')
            throw err;
        }
    }
}



module.exports = jobModel