const { getReadPool, getWritePool } = require('../../../config/db');
const { role: { recruiter }, pagination_limit } = require('../../../config/config');

class Invitation {
    constructor(recruiterEmail, companyId, department, createdAt, deadline) {
        this.recruiterEmail = recruiterEmail;
        this.companyId = companyId;
        this.department = department;
        this.createdAt = createdAt;
        this.deadline = deadline;
        this.status = 2;
    }

    static primaryPool = getWritePool();
    static replicaPool = getReadPool();

    static async getInvitations(userId, userRole, filters, limit = pagination_limit) {
        const values = [userId];
        let index = 1;

        let query =
            userRole === recruiter ?
                `
                select i.id, i.company_id as "companyId", c.name as "companyName", i.department, i.created_at as "dateReceived",
                i.deadline,
                case
                    when i.status = 2 then 'Pending'
                    when i.status = 1 then 'Accepted'
                    else 'Rejected'
                end as status
                from Company_Invitations i
                join Company c on i.company_id = c.id
                where i.recruiter_id = $${index++}
                `:
                `
                select i.id, i.recruiter_id as "recruiterId", r.name as "recruiterName", i.department, i.created_at as "dateSent",
                i.deadline,
                case
                    when i.status = 2 then 'Pending'
                    when i.status = 1 then 'Accepted'
                    else 'Rejected'
                end as status
                from Company_Invitations i
                join recruiter r on i.recruiter_id = r.id
                where i.company_id = $${index++}
                `;

        if (filters.status !== undefined) {
            query += ` and status = $${index++}`;
            values.push(filters.status);
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

        const { rows } = await Invitation.replicaPool.query(query, values);
        return rows;
    }

    async create(produce = null) {
        let values = [];
        const client = await Invitation.primaryPool.connect();

        try {
            await client.query('begin');

            const checkInvitation =
                `
                select 1
                from Company_Invitations
                where recruiter_id = (select id from users where email = $1) and company_id = $2 and status = 2
                `;
            values = [this.recruiterEmail, this.companyId];
            const { rows: existingInvitations } = await client.query(checkInvitation, values);

            if (existingInvitations.length) {
                const err = new Error('An invitation to this recruiter has already been sent');
                err.msg = err.message;
                err.status = 409;
                throw err;
            }

            const insertInvitation =
                `
                INSERT INTO Company_Invitations (recruiter_id, company_id, department, created_at, deadline, status)
                select id, $2, $3, $4, $5, $6
                from users
                where email = $1
                returning recruiter_id as "recruiterId", id as "invitationId"
                `;
            values = [this.recruiterEmail, this.companyId, this.department, this.createdAt, this.deadline, this.status];
            const { rows, rowCount } = await client.query(insertInvitation, values);

            if (!rowCount) {
                const err = new Error('recruiter not found while sending an invitation to him');
                err.msg = 'recruiter not found';
                err.status = 404;
                throw err;
            }
            const { recruiterId, invitationId } = rows[0];

            // retrieve the company name to add it to the produced message
            const getCompanyName =
                `
                select name
                from company
                where id = $1
                `;
            values = [this.companyId];
            const { rows: [{ name: companyName }] } = await client.query(getCompanyName, values);

            if (produce) {
                await produce(companyName, recruiterId);
            }

            try {
                await client.query('commit');
                return invitationId;
            }
            catch (err) {
                err.removeLog = true;
                throw err;
            }
        }
        catch (err) {
            await client.query('rollback')
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async replyToInvitation(invitationId, recruiterId, status, date) {
        let values = [];
        const client = await Invitation.primaryPool.connect();

        try {
            await client.query('begin');

            // check if the invitation exists and not expired
            const selectInvitation =
                `
                select status, deadline, company_id as "companyId"
                from Company_Invitations
                where id = $1
                `;
            values = [invitationId];
            const { rows: invitations } = await client.query(selectInvitation, values);

            if (!invitations.length) {
                const err = new Error('Invitation not found');
                err.msg = err.message;
                err.status = 404;
                throw err;
            }

            const { status: invitationStatus, deadline: invitationDeadline, companyId } = invitations[0];
            if (invitationDeadline.getTime() < date.getTime() || invitationStatus !== 2) {
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
                where id = $2
                returning department
                `;
            values = [status, invitationId];
            const { rows: [{ department }] } = await client.query(updateInvitation, values);

            // link the recruiter to the company with the department in the invitation in case of acception
            if (status == 1) {
                const updateRecruiter =
                    `
                    update Recruiter
                    set company_id = $1, department = $2
                    where id = $3 and company_id is null
                    `;
                values = [companyId, department, recruiterId];
                const { rowCount } = await client.query(updateRecruiter, values);

                // reject the reply if the recruiter is already hired
                if (!rowCount) {
                    const err = new Error('Recruiter is already hired by a company');
                    err.msg = err.message;
                    err.status = 409;
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

    static async authorizeReplyToInvitation(invitationId, recruiterId) {
        const values = [invitationId];
        const query =
            `
            select recruiter_id as "recruiterId"
            from Company_Invitations
            where id = $1
            `;
        const { rows: invitations } = await Invitation.replicaPool.query(query, values);

        if (!invitations.length) {
            const err = new Error('Invitation not found');
            err.msg = err.message;
            err.status = 404;
            throw err;
        }

        const { recruiterId: invitationRecruiterId } = invitations[0];
        if (invitationRecruiterId !== recruiterId) {
            const err = new Error('Unauthorized access on replying to an invitation');
            err.msg = 'Unauthorized request';
            err.status = 403;
            throw err;
        }
    }
}

module.exports = Invitation;