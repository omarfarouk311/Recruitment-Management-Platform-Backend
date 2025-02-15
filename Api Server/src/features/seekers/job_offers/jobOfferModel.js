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
                    ${constants.candidate_status_pending} AS "status"
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
}

module.exports = {
    JobOfferModel
}