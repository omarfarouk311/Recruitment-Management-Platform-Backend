const { getReadPool, getWritePool } = require('../../../../config/db');
const { produce } = require('../../../common/kafka');
const constants = require('../../../../config/config');

class ProfileModel {
    static async getProfile(userId) {
        const readPool = getReadPool();
        const { rows } = await readPool.query(`
            SELECT 
                users.email as email,
                seeker.name as name, seeker.city as city, seeker.country as country,
                seeker.phone_number as "phoneNumber", seeker.date_of_birth as "dateOfBirth", seeker.gender
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
        try {
            const { rows } = await writePool.query(`
                UPDATE job_seeker
                SET name = $1, city = $2, country = $3, phone_number = $4, date_of_birth = $5, gender = $6
                WHERE id = $7
                RETURNING id`, [name, city, country, phoneNumber, dateOfBirth, gender, userId]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0];
        } catch (err) {
            if(err.code === '23505') {
                const error = new Error('Phone number already exists');
                error.msg = 'Phone number already exists';
                error.status = 400;
                throw error;
            }
        }
        
    }

    static async insertProfile(userId, profileData) {
        const writePool = await getWritePool().connect();
        try {
            writePool.query('BEGIN');
            const { name, city, country, phoneNumber, dateOfBirth, gender, experiences, educations, skills, cvId, cvName} = profileData;
            // insert the profile data into the job_seeker table
            let query = `
                INSERT INTO Job_Seeker (id, name, city, country, phone_number, date_of_birth, gender)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `;
            const values = [userId, name, city, country, phoneNumber, dateOfBirth, gender];
            await writePool.query(query, values);

            // insert the cv data into the cv table
            query = `
                INSERT INTO cv (id, name, user_id, created_at, deleted)
                VALUES ($1, $2, $3, NOW(), false)
            `;
            const cvValues = [cvId, cvName, userId];
            await writePool.query(query, cvValues);
            // Produce cv id to kafka for parsing
            const kafkaPromise = produce(cvId, constants.cv_parsing_topic)

            // insert the experience data into the user_experience table
            let placeholders = experiences
                .map((_, index) => `($1, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7}, $${index * 7 + 8})`)
                .join(", ");
            const bulkQuery = `
                INSERT INTO user_experience (user_id, company_name, start_date, end_date, job_title, description, country, city)
                VALUES ${placeholders}
            `;
            const bulkValues = experiences.flatMap(experience => [
                experience.companyName,
                experience.startDate,
                experience.endDate,
                experience.jobTitle,
                experience.description,
                experience.country,
                experience.city,
            ]);
            await writePool.query(bulkQuery, [userId, ...bulkValues]);
            // insert the education data into the user_education table
            placeholders = educations
                .map((_, index) => `($1, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6}, $${index * 6 + 7})`)
                .join(", ");
            query = `
                INSERT INTO education (user_id, school_name, start_date, end_date, degree, field, grade)
                VALUES ${placeholders}
            `
            const educationValues = educations.flatMap(education => [
                education.schoolName, 
                education.startDate, 
                education.endDate, 
                education.degree, 
                education.field, 
                education.grade
            ]);
            await writePool.query(query, [userId, ...educationValues]);
            // insert the skills data into the user_skills table
            query = `
                INSERT INTO user_skills (user_id, skill_id)
                SELECT $1 as user_id, id
                FROM skills
                WHERE id = ANY($2)
            `;
            const skillsValues = [userId, skills];
            await writePool.query(query, skillsValues);
            await kafkaPromise;
            // commit the transaction
            await writePool.query('COMMIT');
            return;
        } catch (err) {
            // rollback the transaction in case of error
            await writePool.query('ROLLBACK');
            throw err;
        } finally {
            writePool.release();
        }

    }
}

module.exports = {
    ProfileModel
};