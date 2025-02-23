const { getReadPool } = require('../../../config/db');
const { pagination_limit } = require('../../../config/config');

class Log {
    static replicaPool = getReadPool();

    static async getLogs(companyId, filters, limit = pagination_limit) {
        const values = [companyId];
        let index = 1;

        //base query
        let query =
            `
            select l.performed_by as "performedBy", l.created_at as "createdAt", l.extra_data as "extraData", a.name as "action"
            from logs l
            join action a on l.action_type = a.id
            where l.company_id = $${index++}
            `;

        //filter by performer
        if (filters.performedBy) {
            query += ` and l.performed_by = $${index++}`;
            values.push(filters.performedBy);
        }

        //filter by action
        if (filters.action) {
            query += ` and l.action_type = $${index++}`;
            values.push(filters.action);
        }

        //filter by date
        if (filters.fromDate) {
            query += ` and l.created_at between $${index++} and $${index++}`;
            values.push(filters.fromDate, filters.toDate);
        }

        // ensure that rows maintain the same order if no sorting filter is applied
        query += ' order by l.id desc';

        // pagination
        query += ` limit $${index++} offset $${index++}`
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await this.replicaPool.query(query, values);
        return rows;
    }

    static async getActions() {
        const query =
            `
            select id, name as action
            from action
            order by id
            `;

        const { rows } = await this.replicaPool.query(query);
        return rows;
    }
}

module.exports = Log;