const { getReadPool } = require('../../../config/db');
const { role: { company, recruiter } } = require('../../../config/config');

class Invitation {
    static async getInvitations(userId, userRole, filters, limit = 10) {
        const pool = getReadPool();
        const values = [userId];
        let index = 1;

        let query =
            userRole === recruiter ?
                `
                select c.id as "companyId", c.name, i.department, i.created_at as "dateRecieved", i.deadline,
                case
                    when i.status = 2 then 'pending'
                    when i.status = 1 then 'accepted'
                    else 'rejected'
                end as status
                from (
                    select company_id, department, created_at, deadline, status
                    from Company_Invitations
                    where recruiter_id = $${index++}
                ) i
                join Company c on i.company_id = c.id
                `:
                `
                select r.id as "recruiterId", r.name, i.department, i.created_at as "dateSent", i.deadline,
                case
                    when i.status = 2 then 'pending'
                    when i.status = 1 then 'accepted'
                    else 'rejected'
                end as status
                from (
                    select recruiter_id, department, created_at, deadline, status
                    from Company_Invitations
                    where company_id = $${index++}
                ) i
                join recruiter r on i.recruiter_id = r.id
                `;

        if (filters.status) {
            query += ` and status = $${index++}`;
            values.push(filters.status)
        }

        if (!Object.keys(filters).some(value => value === 'sortByDate' || value === 'sortByDeadline')) {
            query += (userRole === recruiter ? ' order by c.id' : ' order by r.id');
        }

        else if (filters.sortByDate === 1) {
            query += ' order by i.created_at';
        }

        else if (filters.sortByDate === -1) {
            query += ' order by i.created_at desc';
        }

        else if (filters.sortByDeadline === 1) {
            query += ' order by i.deadline';
        }

        else if (filters.sortByDeadline === -1) {
            query += ' order by i.deadline desc';
        }

        query += ` limit $${index++} offset $${index++}`;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await pool.query(query, values);
        return rows;
    }
}

module.exports = Invitation;
