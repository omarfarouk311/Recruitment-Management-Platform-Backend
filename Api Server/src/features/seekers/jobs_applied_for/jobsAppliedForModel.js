const { getReadPool } = require('../../../../config/db');
const { pagination_limit } = require('../../../../config/config');

class JobsAppliedFor {
    static async getCompaniesFilter(seekerId) {
        const pool = getReadPool();
        const values = [seekerId];
        const query =
            `
            select company_name as "companyName"
            from (
                select company_name
                from candidate_history
                where seeker_id = $1
                union
                select co.name
                from candidates c
                join job j on c.job_id = j.id
                join company co on j.company_id = co.id
                where c.seeker_id = $1
            ) t
            order by company_name
            `;

        const { rows } = await pool.query(query, values);
        return rows.map(({ companyName }) => companyName);
    }

    static async getLocationsFilter(seekerId) {
        const pool = getReadPool();
        const values = [seekerId];
        const query =
            `
            select country, city
            from (
                select country, city
                from candidate_history
                where seeker_id = $1
                union
                select j.country, j.city
                from candidates c
                join job j on c.job_id = j.id
                where c.seeker_id = $1
            ) t
            order by country, city
            `;

        const { rows } = await pool.query(query, values);
        return rows;
    }
}

module.exports = JobsAppliedFor;