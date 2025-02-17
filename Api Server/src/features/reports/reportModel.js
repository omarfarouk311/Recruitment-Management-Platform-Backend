const { getWritePool } = require('../../../config/db');

class Report {
    constructor(jobId, creatorId, createdAt, title, description) {
        this.jobId = jobId;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.title = title;
        this.description = description;
    }

    async create() {
        const pool = getWritePool();
        let values = [];
        const client = await pool.connect();

        try {
            await client.query('begin');

            const getJob = 'select 1 from job where id = $1';
            values = [this.jobId];
            const { rows: { length } } = await client.query(getJob, values);
            if (!length) {
                const err = new Error('Job not found while creating a report');
                err.msg = 'Job not found';
                err.status = 404;
                throw err;
            }

            const createReport =
                `
                insert into report (job_id, creator_id, created_at, title, description)
                values ($1, $2, $3, $4, $5)
                `;
            values = [this.jobId, this.creatorId, this.createdAt, this.title, this.description];
            await client.query(createReport, values);

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback');
            if (err.code === '23505') {
                err.msg = 'A report on this job has already been submitted';
                err.status = 409;
            }
            throw err;
        }
        finally {
            client.release();
        }
    }
}

module.exports = Report;
