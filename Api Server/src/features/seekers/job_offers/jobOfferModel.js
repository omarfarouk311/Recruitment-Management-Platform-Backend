const { getWritePool, getReadPool } = require('../../../../config/db');
const constants = require('../../../../config/config');

class JobOfferModel {
    static async getJobOffers(userId, status, country, city, companyId, sort, offset) {
        let index = 1;
        let params = [userId]
        if(status == constants.candidate_status_pending || !status) {
            var query = `
                    SELECT 
                        j.title AS "jobTitle", comp.name AS "companyName", comp.id AS companyId, 
                        j.id AS "jobId", j.country AS country, j.city AS city, 
                        c.last_status_update AS "dateRecieved", 
                        ${constants.candidate_status_pending} AS "status"
                    FROM candidates c
                    JOIN job j ON c.job_id = j.id
                    JOIN company comp ON j.company_id = comp.id
                    WHERE c.seeker_id = $${index++} AND c.template_id IS NOT NULL 
                `
        }
        else if (status == constants.candidate_status_rejected || status == constants.candidate_status_accepted) {
            var query = `
                SELECT
                    j.title AS "jobTitle", comp.name AS "companyName", j.id AS "jobId",
                    j.country AS country, j.city AS city, c.last_status_update AS "dateRecieved",
                    ${status} AS "status"
                FROM candidate_history c
                JOIN job j ON c.job_id = j.id
                JOIN company comp ON j.company_id = comp.id
                WHERE c.seeker_id = $${index++} AND c.template_description IS NOT NULL AND c.status = $${index++} 
            `
            params.push(status == constants.candidate_status_accepted);
        }
        if(country) {
            query += `AND j.country = $${index++} `
            params.push(country);
        }
        if(city) {
            query += `AND j.city = $${index++} `
            params.push(city);
        }
        if(companyId) {
            query += `AND comp.id = $${index++} `
            params.push(companyId);
        }
        if(sort == constants.desc_order) {
            query += `ORDER BY c.last_status_update DESC `
        }
        else {
            query += `ORDER BY c.last_status_update ASC `
        }
        query += `LIMIT ${constants.pagination_limit} OFFSET $${index++}`
        params.push(offset);
        const readPool = getReadPool();
        const {rows} = await readPool.query(query, params);
        return rows;
    }

    static async getJobOffer(userId, jobId) {
        const readPool = getReadPool();
        let {rows} = await readPool.query(`
            SELECT
                j.description AS "offer", c.placeholders_params AS "placeholdersParams"
            FROM candidates c
            JOIN job_offer_template j ON c.template_id = j.id
            WHERE c.seeker_id = $1 AND c.job_id = $2
        `, [userId, jobId]);

        if(!rows.length) {
            rows = (await readPool.query(`
                SELECT
                    c.template_description AS "offer", c.placeholders_params AS "placeholdersParams"
                FROM candidate_history c
                WHERE c.seeker_id = $1 AND c.job_id = $2
            `, [userId, jobId])).rows;
        }

        if (!rows.length) {
            let error = new Error('Job offer not found');
            error.msg = 'Job offer not found';
            error.status = 404;
            throw error;
        }

        return rows[0];
    }

    static async getCompanyId(jobId) {
        const readPool = getReadPool();
        const {rows} = await readPool.query(`
            SELECT
                company_id
            FROM job
            WHERE id = $1
        `, [jobId]);

        if (!rows.length) {
            let error = new Error('Job offer not found');
            error.msg = 'Job offer not found';
            throw error;
        }

        return rows[0].company_id;
    }
    static async getCompanyNames(userId, status) {
        const readPool = getReadPool();
        if(status == constants.candidate_status_pending || !status) {
            const {rows} = await readPool.query(`
                SELECT
                    DISTINCT comp.name AS "companyName",
                    comp.id AS "companyId"
                FROM candidates c
                JOIN job j ON c.job_id = j.id
                JOIN company comp ON j.company_id = comp.id
                WHERE c.seeker_id = $1 AND c.template_id IS NOT NULL
            `, [userId]);
            return rows
        }
        else {
            const {rows} = await readPool.query(`
                SELECT
                    DISTINCT comp.name AS "companyName",
                    comp.id AS "companyId"
                FROM candidate_history c
                JOIN job j ON c.job_id = j.id
                JOIN company comp ON j.company_id = comp.id
                WHERE c.seeker_id = $1 AND c.template_description IS NOT NULL AND c.status = $2
            `, [userId, status == constants.candidate_status_accepted]);
            return rows
        }
    }
}

module.exports = {
    JobOfferModel
}