const { getWritePool } = require('../../../../config/db');

class CV {
    constructor(id, name, seekerId, createdAt) {
        this.id = id;
        this.seekerId = seekerId;
        this.name = name;
        this.createdAt = createdAt;
        this.deleted = false;
    }

    static primaryPool = getWritePool();

    // use the primary instance pool to get the latest count in case of replication delay
    static async getCVsCount(seekerId) {
        const query =
            `
            select count(id)::int as "cnt"
            from cv
            where user_id = $1
            `;

        const { rows: [{ cnt }] } = await CV.primaryPool.query(query, [seekerId]);
        return cnt;
    }

    async create() {
        const query =
            `
            insert into cv (id, name, user_id, created_at, deleted)
            values ($1, $2, $3, $4, $5)
            `;
        const values = [this.id, this.name, this.seekerId, this.createdAt, this.deleted];

        await CV.primaryPool.query(query, values);
    }

    static async getIdFromSequence() {
        const { rows: [{ id }] } = await CV.primaryPool.query("select nextval('cv_id_seq') as id");
        return id;
    }
}

module.exports = CV;