const { getWritePool, getReadPool } = require('../../../../config/db');

class Experience {
    static async getAllExperiences(userId) {
        const pool = getReadPool();
        const query = `
            SELECT 
                id, company_name as "companyName",
                start_date as "startDate", end_date as "endDate",
                description, job_title as "jobTitle",
                country, city
            FROM User_Experience
            WHERE user_id = $1
            ORDER BY 
            CASE WHEN end_date IS NULL THEN 1 ELSE 0 END, 
            end_date DESC;
        `;
        const values = [userId];
        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async addExperience(experienceData, produce) {
        const client = await getWritePool().connect();

        try {
            await client.query('begin');

            const query = `
            INSERT INTO User_Experience (user_id, company_name, start_date, end_date, description, job_title, country, city)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
            `;
            const values = [
                experienceData.userId,
                experienceData.companyName,
                experienceData.startDate,
                experienceData.endDate,
                experienceData.description,
                experienceData.jobTitle,
                experienceData.country,
                experienceData.city
            ];
            const { rows } = await client.query(query, values);

            if (produce) await produce();
            await client.query('commit');
            return rows[0];
        }
        catch (err) {
            await client.query('rollback')
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async updateExperience(experienceId, experienceData, produce) {
        const client = await getWritePool().connect();

        try {
            await client.query('begin');

            const query = `
            UPDATE User_Experience
            SET company_name = $1, start_date = $2, end_date = $3, description = $4, job_title = $5, country = $6, city = $7
            WHERE id = $8
            `;
            const values = [
                experienceData.companyName,
                experienceData.startDate,
                experienceData.endDate,
                experienceData.description,
                experienceData.jobTitle,
                experienceData.country,
                experienceData.city,
                experienceId,
            ];
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

    static async deleteExperience(experienceId) {
        const pool = getWritePool();
        const query = `
            DELETE FROM User_Experience
            WHERE id = $1
        `;
        const values = [experienceId];
        await pool.query(query, values);
    }

    static async getExperienceOwner(experienceId) {
        const pool = getReadPool();
        const query = `
            SELECT user_id as "userId" FROM User_Experience
            WHERE id = $1;
        `;
        const values = [experienceId];
        const { rows } = await pool.query(query, values);
        return rows.length === 0 ? null : rows[0].userId;
    }
}

module.exports = Experience;