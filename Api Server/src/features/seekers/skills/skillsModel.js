const { getReadPool, getWritePool } = require('../../../../config/db');


class SkillModel {
    
    static getSeekerSkillsById = async (seekerId) => {
        let client = getReadPool();
        try {
            const query = `
                            SELECT Skills.id as skillId, Skills.name as skillName
                            FROM (
                                    SELECT skill_id
                                    FROM User_Skills
                                    WHERE user_id = $1
                                ) as skillIds
                            JOIN Skills 
                            ON skillIds.skill_id = Skills.id
                    `
            const skills = await client.query(query, [seekerId]);
            return skills.rows;

        } catch (err) {
            throw err;
        }
    }


    static addSeekerSkills = async (client, seekerId, skills) => {
        const query1 = `
                SELECT 1 AS count
                FROM User_Skills
                WHERE user_id = $1 AND skill_id = $2
                LIMIT 1
             `;

        const query2 = `
                INSERT INTO User_Skills (user_id, skill_id)
                VALUES ($1, $2)
             `;

        let fail = false;

        for (const skill of skills) {
            const skillId = skill.skillId;
            const result = await client.query(query1, [seekerId, skillId]);
            if (result.rows.length > 0) {
                fail = true;
                break;
            }
        }

        if (fail) {
            const error = new Error('Some skills already exist');
            error.msg = 'Some skills already exist';
            error.status = 400;
            throw error;
        }

        await Promise.all(skills.map(skill =>
            client.query(query2, [seekerId, skill.skillId])
        ));

        return 'Skills added successfully';
    }


    static deleteSeekerSkillById = async (client, seekerId, skills) => {
        try {
            const query = `
                            DELETE FROM User_Skills
                            WHERE user_id = $1 AND skill_id = $2
                        `; 
            const deletionPromise = skills.map(async (skillId) => {
                skillId = skillId.skillId
                await client.query(query, [seekerId, skillId]); 
            })
            await Promise.all(deletionPromise);

            return 'Skills deleted successfully';
        } catch (err) {
            throw err;
        }
    }

}

module.exports = {
    SkillModel
}