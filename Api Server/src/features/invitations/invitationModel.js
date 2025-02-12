const { getReadPool, getWritePool } = require('../../../config/db');
const { role: { recruiter }, logs_topic, emails_topic, action_types: { send_invitation }, action_types } = require('../../../config/config');
const { produce } = require('../../common/kafka');
const { v6: uuidv6 } = require('uuid');

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
        const pool = getWritePool();
        let values = [];
        const client = await pool.connect();

        try {
            await client.query('begin');

            const insertInvitation =
                `
                INSERT INTO Company_Invitations (recruiter_id, company_id, department, created_at, deadline, status)
                select id, $2, $3, $4, $5, $6
                from users
                where email = $1
                returning recruiter_id
                `;
            values = [this.recruiterEmail, this.companyId, this.department, this.createdAt, this.deadline, this.status];
            const { rows, rowCount } = await client.query(insertInvitation, values);
            if (!rowCount) {
                const err = new Error('recruiter not found while sending an invitation to him');
                err.msg = 'recruiter not found';
                err.status = 404;
                throw err;
            }
            const { recruiter_id: recruiterId } = rows[0];
            console.log(recruiterId);

            // retrieve the company name to add it to the produced message
            const getCompanyName =
                `
                select name
                from company
                where id = $1
                `;
            values = [this.companyId];
            const { rows: [{ name: companyName }] } = await client.query(getCompanyName, values);

            // produced message into logs topic
            const logData = {
                id: uuidv6(),
                performed_by: companyName,
                company_id: this.companyId,
                created_at: this.createdAt,
                extra_data: {
                    to: this.recruiterEmail
                },
                action_type: send_invitation
            }
            // produced message into emails topic
            const emailData = {
                type: 4,
                recruiterId,
                companyId: this.companyId,
                department: this.department,
                deadline: this.deadline
            }
            // produce messages into their topics
            await Promise.all[produce(logData, logs_topic), produce(emailData, emails_topic)];

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback')
            if (err.code === '23505') {
                err.msg = 'An invitation to this recruiter has already been sent';
                err.status = 409;
            }
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async replyToInvitation(recruiterId, companyId, status, date) {
        const pool = getWritePool();
        let values = [];
        const client = await pool.connect();

        try {
            await client.query('begin');

            // check if the invitation exists and not expired
            const selectInvitation =
                `
                select status, deadline
                from Company_Invitations
                where recruiter_id = $1 and company_id = $2
                `;
            values = [recruiterId, companyId];
            const { rows: invitations, rowCount: invitationsCount } = await client.query(selectInvitation, values)
            if (!invitationsCount) {
                const err = new Error('Invitation not found');
                err.msg = err.message;
                err.status = 404;
                throw err;
            }
            const invitation = invitations[0];
            if (invitation.deadline.getTime() < date.getTime() || invitation.status !== 2) {
                const err = new Error('Invitation expired');
                err.msg = err.message;
                err.status = 400;
                throw err;
            }

            // update invitation status if it's found and the status is pending and it's not expired
            const updateInvitation =
                `
                update Company_Invitations
                set status = $1
                where recruiter_id = $2 and company_id = $3
                returning department
                `;
            values = [status, recruiterId, companyId];
            const { rows: [{ department }] } = await client.query(updateInvitation, values);

            // link the recruiter to the company with the department in the invitation in case of acception
            if (status) {
                const updateRecruiter =
                    `
                update Recruiter
                set company_id = $1, department = $2
                where id = $3 and company_id is null
                `;
                values = [companyId, department, recruiterId];
                const { rowCount } = await client.query(updateRecruiter, values);
                if (!rowCount) {
                    const err = new Error('Recruiter is already hired by a company');
                    err.msg = err.message;
                    err.status = 400;
                    throw err;
                }
            }

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback')
            throw err;
        }
        finally {
            client.release();
        }
    }

}

module.exports = Invitation;
