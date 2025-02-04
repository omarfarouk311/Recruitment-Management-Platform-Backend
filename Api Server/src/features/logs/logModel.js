const { getReadPool } = require('../../../config/db');

class Logs {
    static async getLogs(companyId, filters, limit = 5) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        //base query
        let query =
            `select performed_by as "performedBy", created_at as "createdAt", extra_data as "extraData",action_type as "actionType"
            from logs
            where company_id = $${index++}`

        //filter by performer
        if (filters.performedBy) {
            query += ` and performed_by = $${index++}`;
            values.push(filters.performedBy);
        }

        //filter by action
        if (filters.action) {
            query += ` and action_type = $${index++}`;
            values.push(filters.action);
        }

        //filter by date
        if (filters.date) {
            query += ` and created_at between $${index++} and $${index++}`;
            const endDate = new Date(filters.date.getTime() + 24 * 60 * 60 * 1000);
            values.push(filters.date, endDate);
        }

        query += ` limit $${index++} offset $${index++}`
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await pool.query(query, values);
        return rows;
    }
}

module.exports = Logs;
