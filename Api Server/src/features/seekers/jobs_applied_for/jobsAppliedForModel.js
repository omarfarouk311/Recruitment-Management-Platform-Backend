const { getReadPool } = require('../../../../config/db');
const { pagination_limit } = require('../../../../config/config');

class JobsAppliedFor {
    static async getCompaniesFilter(seekerId) {
        const pool = getReadPool();
        const values = [seekerId];
        const query =
            `
            select company_name as "companyName"
            from candidate_history
            where seeker_id = $1
            union
            select co.name
            from candidates c
            join job j on c.job_id = j.id
            join company co on j.company_id = co.id
            where c.seeker_id = $1
            `;

        const { rows } = await pool.query(query, values);
        return rows.map(({ companyName }) => companyName);
    }
}

module.exports = JobsAppliedFor;