const { getReadPool } = require('../../../../config/db');
const { pagination_limit } = require('../../../../config/config');

class JobsAppliedFor {
    static getReplicaPool() {
        return getReadPool();
    }

    static async getJobsAppliedFor(seekerId, filters, limit = pagination_limit) {
        const values = [seekerId];
        let index = 1;
        let query;

        // pending status (default)
        if (filters.status === undefined) {
            query =
                `
                select j.id as "jobId", j.title as "jobTitle", co.id as "companyId", co.name as "companyName", j.country, j.city, c.date_applied as "dateApplied", c.last_status_update as "lastStatusUpdate", r.name as "phase", 'Pending' as status
                from candidates c
                join job j on c.job_id = j.id
                join company co on j.company_id = co.id
                join recruitment_phase r on j.recruitment_process_id = r.recruitment_process_id and c.phase = r.phase_num
                where c.seeker_id = $${index++}
                `;

            if (filters.country) {
                query += ` and j.country = $${index++}`;
                values.push(filters.country);
            }
            if (filters.city) {
                query += ` and j.city = $${index++}`;
                values.push(filters.city);
            }
            if (filters.companyName) {
                query += ` and co.name = $${index++}`;
                values.push(filters.companyName);
            }
            if (filters.remote) {
                query += ' and j.remote = true';
            }
        }
        // accepted or rejected status
        else {
            query =
                `
                select j.id as "jobId", c.job_title as "jobTitle", j.company_id as "companyId", c.company_name as "companyName", c.country, c.city, c.date_applied as "dateApplied", c.last_status_update as "lastStatusUpdate", c.phase_name as "phase",
                case 
                    when c.status = true then 'Accepted'
                    else 'Rejected'
                end as status
                from candidate_history c
                left join job j on c.job_id = j.id
                where c.seeker_id = $${index++} and c.status = $${index++}
                `;
            values.push(filters.status);

            if (filters.country) {
                query += ` and c.country = $${index++}`;
                values.push(filters.country);
            }
            if (filters.city) {
                query += ` and c.city = $${index++}`;
                values.push(filters.city);
            }
            if (filters.companyName) {
                query += ` and c.company_name = $${index++}`;
                values.push(filters.companyName);
            }
            if (filters.remote) {
                query += ' and c.remote = true';
            }
        }

        //sorting
        if (filters.sortByDate === 1) {
            query += ' order by c.date_applied';
        }
        else if (filters.sortByDate === -1) {
            query += ' order by c.date_applied desc';
        }
        else if (filters.sortByStatusUpdate === 1) {
            query += ' order by c.last_status_update';
        }
        else if (filters.sortByStatusUpdate === -1) {
            query += ' order by c.last_status_update desc';
        }
        else {
            query += ' order by c.job_id';
        }

        // pagination
        query += ` limit $${index++} offset $${index++}`;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await JobsAppliedFor.getReplicaPool().query(query, values);
        return rows;
    }

    static async getCompaniesFilter(seekerId) {
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

        const { rows } = await JobsAppliedFor.getReplicaPool().query(query, values);
        return rows.map(({ companyName }) => companyName);
    }

    static async getLocationsFilter(seekerId) {
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

        const { rows } = await JobsAppliedFor.getReplicaPool().query(query, values);
        return rows;
    }
}

module.exports = JobsAppliedFor;