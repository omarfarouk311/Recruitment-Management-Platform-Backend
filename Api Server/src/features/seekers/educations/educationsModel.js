const { getWritePool, getReadPool } = require('../../../../config/db')

class educationModel {
    static getPrimaryPool() {
        return getWritePool();
    }

    static getReplicaPool() {
        return getReadPool();
    }

    static async addEducation(seekerId, school_name, field, degree, grade, start_date, end_date, produce) {
        const client = await educationModel.getPrimaryPool().connect();
        try {
            await client.query('begin');

            const values = [seekerId, school_name, field, degree, grade, start_date, end_date];
            const placeHolder = [`$1`, `$2`, `$3`, `$4`, `$5`, `$6`, `$7`];
            let query = 'INSERT INTO Education (user_id, school_name, field, degree, grade, start_date, end_date)';
            query += ` VALUES(${placeHolder.join(', ')}) RETURNING id`;
            const res = await client.query(query, values);

            if (produce) await produce();
            await client.query('commit');
            return res.rows[0].id;
        }
        catch (err) {
            await client.query('rollback')
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async getEducation(seekerId) {
        let replica_DB = educationModel.getReplicaPool();
        let query =
            `SELECT id,school_name,field,degree,grade,start_date,end_date
            FROM Education 
            WHERE user_id=$1
            ORDER BY end_date DESC
            `;
        let value = [seekerId];
        let { rows } = await replica_DB.query(query, value);
        return rows;
    }

    static async deleteEducation(educationId, seekerId) {
        let primary_DB = educationModel.getPrimaryPool();
        let query = `DELETE FROM Education WHERE id=$1 AND user_id=$2`;
        let values = [educationId, seekerId];
        await primary_DB.query(query, values);
    }

    static async editEducation(seekerId, educationId, school_name, field, degree, grade, start_date, end_date, produce) {
        const client = await educationModel.getPrimaryPool().connect();
        try {
            await client.query('begin');

            const query = ` 
            UPDATE Education SET school_name = $1, field = $2, degree = $3, grade = $4, start_date = $5, end_date = $6
            WHERE id = $7 AND user_id = $8
            `;
            const values = [school_name, field, degree, grade, start_date, end_date, educationId, seekerId];
            await client.query(query, values);

            if (produce) await produce();
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

    static async getEducationOwner(educationId) {
        const pool = educationModel.getReplicaPool();
        const query = `
            SELECT user_id as "userId" FROM Education
            WHERE id = $1;
        `;
        const values = [educationId];
        const { rows } = await pool.query(query, values);
        return rows.length === 0 ? null : rows[0].userId;
    }
}

module.exports = educationModel;