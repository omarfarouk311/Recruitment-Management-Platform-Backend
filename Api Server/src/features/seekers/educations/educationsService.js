const educationModel = require('./educationsModel');
const { profile_embedding_topic } = require('../../../../config/config');
const Kafka = require('../../../common/kafka')

module.exports.addEducationService = async (seekerId, school_name, field, degree, grade, start_date, end_date) => {
    const kafkaProduce = async () => {
        // produced message into profile embedding topic
        const data = {
            id: null,
            userId: seekerId
        };
        await Kafka.produce(data, profile_embedding_topic);
    }

    return educationModel.addEducation(seekerId, school_name, field, degree, grade, start_date, end_date, kafkaProduce);
}

module.exports.getEducationService = async (seekerId) => {
    return educationModel.getEducation(seekerId);
}

module.exports.deleteEducationService = async (educationId, seekerId) => {
    return educationModel.deleteEducation(educationId, seekerId);
}

module.exports.editEducationService = async (seekerId, educationId, school_name, field, degree, grade, start_date, end_date) => {
    const kafkaProduce = async () => {
        // produced message into profile embedding topic
        const data = {
            id: null,
            userId: seekerId
        };
        await Kafka.produce(data, profile_embedding_topic);
    }

    return educationModel.editEducation(seekerId, educationId, school_name, field, degree, grade, start_date, end_date, kafkaProduce);
}

