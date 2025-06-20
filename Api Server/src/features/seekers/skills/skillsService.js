const { SkillModel }  = require('./skillsModel')
const Pool = require('../../../../config/db');
const { profile_embedding_topic } = require('../../../../config/config')
const Kafka = require('../../../common/kafka')


module.exports.getSeekerSkillsById = async (seekerId) => {
    const skills = await SkillModel.getSeekerSkillsById(seekerId) 
    return skills
}

module.exports.addSeekerSkills = async (seekerId, skills) => {
    let client = await Pool.getWritePool().connect();
    try {
      
        await client.query('BEGIN');
        const insertionMsg = SkillModel.addSeekerSkills(client, seekerId, skills)
        const promise = Kafka.produce(
            {
                id: null,
                userId: seekerId
            },
            profile_embedding_topic
        )
        await Promise.all([insertionMsg, promise]);
        await client.query('COMMIT');
        return insertionMsg
    } catch (err) {
        await client.query('ROLLBACK')
        throw err;
    } finally {
        client.release();
    }
}

module.exports.deleteSeekerSkillById = async (seekerId, skillId) => {
    let client = await Pool.getWritePool().connect();
    try {
        await client.query('BEGIN');
        const deleteMsg = SkillModel.deleteSeekerSkillById(client, seekerId, skillId)
        const promise = Kafka.produce(
            {
                id: null,
                userId: seekerId,
                type: 'profile'
            },
            profile_embedding_topic
        )
        await Promise.all([deleteMsg, promise]);
        await client.query('COMMIT');
        return deleteMsg
    } catch (err) {
        await client.query('ROLLBACK')
        throw err;
    } finally {
        client.release();
    }
}