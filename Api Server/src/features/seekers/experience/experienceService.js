const Experience = require('./experienceModel');
const { produce } = require('../../../common/kafka');
const { profile_embedding_topic } = require('../../../../config/config');

exports.getAllExperiences = async (userId) => {
    return Experience.getAllExperiences(userId);
};

exports.addExperience = async (experienceData) => {
    const kafkaProduce = async () => {
        // produced message into profile embedding topic
        const data = {
            id: null,
            userId: experienceData.userId
        };
        await produce(data, profile_embedding_topic);
    }

    return Experience.addExperience(experienceData, kafkaProduce);
};

exports.updateExperience = async (experienceId, experienceData) => {
    const kafkaProduce = async () => {
        // produced message into profile embedding topic
        const data = {
            id: null,
            userId: experienceData.userId
        };
        await produce(data, profile_embedding_topic);
    }

    return Experience.updateExperience(experienceId, experienceData, kafkaProduce);
};

exports.deleteExperience = async (experienceId) => {
    return Experience.deleteExperience(experienceId);
};