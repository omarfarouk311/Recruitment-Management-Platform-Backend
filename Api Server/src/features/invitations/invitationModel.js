const { getReadPool, getWritePool } = require('../../../config/db');
const { role: { company, recruiter } } = require('../../../config/config');

class Invitation {
    constructor(recruiterEmail, companyId, department, createdAt, deadline, status) {
        this.recruiterEmail = recruiterEmail;
        this.companyId = companyId;
        this.department = department;
        this.createdAt = createdAt;
        this.deadline = deadline;
        this.status = status;
    }

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

    async create() {
        try {
            const pool = getWritePool();
            const values = [this.recruiterEmail, this.companyId, this.department, this.createdAt, this.deadline, this.status];
            const query =
                `
            INSERT INTO Company_Invitations (recruiter_id, company_id, department, created_at, deadline, status)
            select id, $2, $3, $4, $5, $6
            from users
            where email = $1
            `;

            const { rowCount } = await pool.query(query, values)
            if (!rowCount) {
                let err = new Error('recruiter not found while sending an invitation to him');
                err.msg = 'recruiter not found';
                err.status = 404;
                throw err;
            }
        }
        catch (err) {
            if (err.code === '23505') {
                err.msg = 'An invitation to this recruiter has already been sent';
                err.status = 409;
            }
            throw err;
        }
    }

}

module.exports = Invitation;
