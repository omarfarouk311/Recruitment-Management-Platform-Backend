const Experience = require('./experienceModel');

exports.getAllExperiences = async (userId) => {
    return await Experience.getAllExperiences(userId);
};

exports.addExperience = async (experienceData) => {
    return await Experience.addExperience(experienceData);
};

exports.updateExperience = async (experienceId, experienceData) => {
    return await Experience.updateExperience(experienceId, experienceData);
};

exports.deleteExperience = async (experienceId) => {
    return await Experience.deleteExperience(experienceId);
};