const { getWritePool, getReadPool } = require('../../../../config/db');
const { role } = require('../../../../config/config');

class CV {
    constructor(id, name, seekerId, createdAt) {
        this.id = id;
        this.seekerId = seekerId;
        this.name = name;
        this.createdAt = createdAt;
        this.deleted = false;
    }

    static getMasterPool() {
        return getWritePool();
    }

    // use the primary instance pool to get the latest count in case of replication delay
    static async getCVsCount(seekerId) {
        const query =
            `
            select count(id)::int as "cnt"
            from cv
            where user_id = $1 AND deleted = False
            `;

        const { rows: [{ cnt }] } = await CV.getMasterPool().query(query, [seekerId]);
        return cnt;
    }

    async create(produce) {
        const client = await CV.getMasterPool().connect();

        try {
            await client.query('BEGIN');

            const query = `
                insert into cv (id, user_id, name, created_at, deleted)
                values ($1, $2, $3, $4, $5)
            `;
            const values = [this.id, this.seekerId, this.name, this.createdAt, this.deleted];
            await client.query(query, values);

            await produce(this.id);

            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async getIdFromSequence() {
        const { rows: [{ id }] } = await CV.getMasterPool().query("select nextval('cv_id_seq') as id");
        return id;
    }

    static async getCvName(jobId, seekerId, userId, userRole) {
        const client = getReadPool();
        let query;
        if (userRole === role.jobSeeker) {
            query = await client.query(`
                    SELECT id, name, created_at
                    FROM CV
                    WHERE user_id = $1 
                    AND deleted = $2;
                `, [userId, false]);
        }
        else if (userRole === role.recruiter) {
            query = await client.query(`
                        SELECT id, name
                        FROM (
                                SELECT cv_id
                                FROM Candidates
                                WHERE job_id = $1
                                AND seeker_id = $2
                                AND recruiter_id = $3
                            ) as tmp
                        JOIN CV cv
                        ON cv.id = tmp.cv_id
                `, [jobId, seekerId, userId]);

            if (query.rows.length == 0) {
                const error = new Error('Recruiter is not authorized to access this CV');
                error.status = 403;
                error.msg = 'Authorization Error';
                throw error;
            }
        }
        else if (userRole === role.company) {
            query = await client.query(`
                        SELECT id, name
                        FROM (
                                SELECT c.cv_id
                                FROM Candidates c
                                JOIN Job j
                                ON j.id = c.job_id
                                WHERE c.job_id = $1
                                AND c.seeker_id = $2
                                AND j.company_id = $3
                            ) as tmp
                        JOIN CV cv
                        ON cv.id = tmp.cv_id
                `, [jobId, seekerId, userId]);

            if (query.rows.length == 0) {
                const error = new Error('Company is not authorized to access this CV');
                error.status = 403;
                error.msg = 'Authorization Error';
                throw error;
            }
        }
        return query.rows;
    }

    static async downloadCV(cvId, userId, userRole, seekerId, jobId) {
        const client = getReadPool();
        let query;
        if (userRole == role.jobSeeker) {
            query = await client.query(`
                    SELECT user_id
                    FROM CV
                    WHERE id = $1;
                `, [cvId]);
            if (query.rows[0].user_id != userId) {
                const error = new Error('You are not authorized to access this CV');
                error.status = 403;
                error.msg = 'Authorization Error';
                throw error;
            }
        }
        else if (userRole == role.recruiter) {
            query = await client.query(`
                        SELECT 1
                        FROM Candidates
                        WHERE seeker_id = $1
                        AND job_id = $2
                        AND recruiter_id = $3;
                    `, [seekerId, jobId, userId]);

            if (query.rows.length == 0) {
                const error = new Error('Recruiter is not authorized to access this CV');
                error.status = 403;
                error.msg = 'Authorization Error';
                throw error;
            }
        }
        else if (userRole === role.company) {
            query = await client.query(`
                    SELECT id, name
                    FROM (
                            SELECT c.cv_id
                            FROM Candidates c
                            JOIN Job j
                            ON j.id = c.job_id
                            WHERE c.job_id = $1
                            AND c.seeker_id = $2
                            AND j.company_id = $3
                        ) as tmp
                    JOIN CV cv
                    ON cv.id = tmp.cv_id
            `, [jobId, seekerId, userId]);

            if (query.rows.length == 0) {
                const error = new Error('Company is not authorized to access this CV');
                error.status = 403;
                error.msg = 'Authorization Error';
                throw error;
            }
        }
    }

    static async deleteCV(cvId, userId) {
        let client;
        try {
            client = await getWritePool().connect();
            await client.query('BEGIN');
            let result = await client.query(`
                SELECT id
                FROM CV
                WHERE id != $1 AND user_id = $2 AND deleted = $3
                LIMIT 1
                FOR UPDATE;
            `, [cvId, userId, false]);

            if (result.rowCount === 0) {
                const error = new Error('Seeker must have at least one CV');
                error.msg = 'Seeker must have at least one CV';
                error.status = 409;
                throw error;
            }

            let id = await client.query(`
                UPDATE CV
                SET deleted = $1
                WHERE id = $2 and user_id = $3
                RETURNING id;
            `, [true, cvId, userId]);

            await client.query('COMMIT');
        } catch (err) {
            if (client) {
                await client.query('ROLLBACK');
            }
            throw err;
        } finally {
            if (client) {
                client.release();
            }
        }
    }


    static async getCvsForJob(jobId, seekerId) {
        const client = getReadPool();
        try {
            const query = `
                SELECT c.id, c.name
                FROM cv c
                LEFT JOIN cv_embedding ce ON ce.cv_id = c.id
                WHERE c.user_id = $1 and c.deleted = $2
                ORDER BY ce.vector <=> (
                    SELECT embedding
                    FROM job_embedding
                    WHERE job_id = $3
                )
            `;
            const values = [seekerId, false, jobId];
            const { rows } = await client.query(query, values);
            return rows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CV;