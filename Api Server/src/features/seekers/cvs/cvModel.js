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
                RETURNING id
            `;
            const values = [this.id, this.seekerId, this.name, this.createdAt, this.deleted];
            const { rows } = await client.query(query, values);

            await produce(this.id);

            await client.query('COMMIT');

            return rows[0];
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
        try {
            let query;
            if (userRole == role.jobSeeker) {
                query = await client.query(`
                    SELECT id, name, created_at
                    FROM CV
                    WHERE user_id = $1 
                    AND deleted = $2;
                `, [userId, false]);
            }
            else {
                if (userRole == role.recruiter) {
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
                }
                else {
                    query = await client.query(`
                        SELECT recruiter_id
                        FROM Candidates
                        WHERE seeker_id = $1 
                        AND job_id = $2`
                        , [seekerId, jobId]
                    )
                    let query2 = await client.query(`
                        select company_id
                        from Recruiter
                        WHERE id = $1;
                    `, [query.rows[0].recruiter_id])

                    if (query2.rows[0].company_id != userId) {
                        const error = new Error('You are not authorized to access this CV');
                        error.status = 403;
                        error.msg = 'Authorization Error';
                        throw error;
                    }
                    console.log(query2.rows[0].company_id)
                    query = await client.query(`
                        SELECT id, name
                        FROM (
                                SELECT cv_id
                                FROM Candidates
                                WHERE job_id = $1
                                AND seeker_id = $2
                            ) as tmp
                        JOIN CV cv
                        ON cv.id = tmp.cv_id
                `, [jobId, seekerId]);
                }
            }
            return query.rows;
        } catch (err) {
            throw err;
        }
    }

    static async downloadCV(cvId, userId, userRole, seekerId, jobId) {
        const client = getReadPool();
        try {
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
            } else {
                if (userRole == role.recruiter) {
                    query = await client.query(`
                        SELECT 1
                        FROM Candidates
                        WHERE seeker_id = $1
                        AND job_id = $2
                        AND recruiter_id = $3;
                    `, [seekerId, jobId, userId]);

                    if (query.rows.length == 0) {
                        const error = new Error('You are not authorized to access this CV');
                        error.status = 403;
                        error.msg = 'Authorization Error';
                        throw error;
                    }
                } else {
                    query = await client.query(`
                        SELECT recruiter_id
                        FROM Candidates
                        WHERE seeker_id = $1
                        AND job_id = $2;
                    `, [seekerId, jobId]);
                    if (query.rows.length == 0) {
                        const error = new Error();
                        error.status = 403;
                        error.msg = 'seeker id and job id are incorrect';
                        throw error;
                    }
                    let query2 = await client.query(`
                        select company_id
                        from Recruiter
                        WHERE id = $1;
                    `, [query.rows[0].recruiter_id])
                    if (query2.rows[0].company_id != userId) {
                        const error = new Error('You are not authorized to access this CV');
                        error.status = 403;
                        error.msg = 'Authorization Error';
                        throw error;
                    }
                }
                return;
            }
        } catch (err) {
            throw err;
        }
    }

    static async deleteCV(cvId, userId) {
        const client = getWritePool();
        try {
            await client.query(`
                UPDATE CV
                SET deleted = $1
                WHERE id = $2 and user_id = $3;
            `, [true, cvId, userId]);
            return 'CV deleted successfully';
        } catch (err) {
            throw err;
        }
    }


    static async getCvsForJob(jobId, seekerId) {
        const client = getReadPool();
        try {
            const query = `
                SELECT c.id, c.name
                FROM (
                    SELECT id, name
                    FROM cv
                    WHERE user_id = $1 and deleted = $2
                ) as c
                JOIN cv_embedding ce
                ON ce.cv_id = c.id
                CROSS JOIN (
                    SELECT embedding
                    FROM job_embedding 
                    WHERE job_id = $3
                ) as j
                ORDER BY ce.vector <=> j.embedding
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