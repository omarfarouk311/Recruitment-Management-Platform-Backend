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
            ORDER BY end_date DESC;
        `;
        const values = [userId];
        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async addExperience(experienceData) {
        const pool = getWritePool();
        const query = `
            INSERT INTO User_Experience (user_id, company_name, start_date, end_date, description, job_title, country, city)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
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
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async updateExperience(experienceId, experienceData) {
        const pool = getWritePool();
        const query = `
            UPDATE User_Experience
            SET company_name = $1, start_date = $2, end_date = $3, description = $4, job_title = $5, country = $6, city = $7
            WHERE id = $8
            RETURNING *;
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
        console.log(experienceData);
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async deleteExperience(experienceId) {
        const pool = getWritePool();
        const query = `
            DELETE FROM User_Experience
            WHERE id = $1
            RETURNING *;
        `;
        const values = [experienceId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getExperienceById(experienceId) {
        const pool = getReadPool();
        const query = `
            SELECT * FROM User_Experience
            WHERE id = $1;
        `;
        const values = [experienceId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = Experience;