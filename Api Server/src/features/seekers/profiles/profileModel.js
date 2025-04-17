const { getReadPool, getWritePool } = require('../../../../config/db');

class ProfileModel {
    static async getProfile(userId) {
        const readPool = getReadPool();
        const { rows } = await readPool.query(`
            SELECT 
                users.email as email,
                seeker.name as name, seeker.city as city, seeker.country as country,
                seeker.phone_number as "phoneNumber", seeker.date_of_birth as "dateOfBirth"
            FROM job_seeker seeker
            JOIN users USING(id) 
            WHERE seeker.id = $1`, [userId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }

    static async updateProfile(userId, profileData) {
        const writePool = getWritePool();
        let { name, city, country, phoneNumber, dateOfBirth, gender } = profileData;
        const { rows } = await writePool.query(`
            UPDATE job_seeker
            SET name = $1, city = $2, country = $3, phone_number = $4, date_of_birth = $5, gender = $6
            WHERE id = $7
            RETURNING id`, [name, city, country, phoneNumber, dateOfBirth, gender, userId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }

    static async insertProfile(userId, profileData) {
        const writePool = getWritePool();
        const { name, city, country, phoneNumber, dateOfBirth, gender } = profileData;
        const query = `
            INSERT INTO Job_Seeker (id, name, city, country, phone_number, date_of_birth, gender)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
        const values = [userId, name, city, country, phoneNumber, dateOfBirth, gender];
        await writePool.query(query, values);
    }
}

module.exports = {
    ProfileModel
};