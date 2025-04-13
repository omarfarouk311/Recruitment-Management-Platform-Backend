const interviewModel = require('./interviewModel')
const Pool = require('../../../config/db')
const Kafka = require('../../common/kafka')
const { action_types, logs_topic, emails_topic } = require('../../../config/config')
const { v6: uuid } = require('uuid');


module.exports.getRecruiterInterviewsData = async (id, filters) => {
    const { page, title, sort, city, country } = filters;
    const interviews = await interviewModel.getRecruiterInterviewsData(id, page, title, sort, city, country);
    return interviews;
}


module.exports.getSeekerInterviewsData = async (id, filters) => {
    const { page, sort, city, country, companyName } = filters;
    const interviews = await interviewModel.getSeekerInterviewsData(id, page, sort, city, country, companyName);
    return interviews;
}

module.exports.modifyInterviewDate = async (recruiterId, jobId, seekerId, timestamp) => {

    // start the transaction here, as we will add the email functionality and will wait until we get ack from kafka
    const client = await Pool.getWritePool().connect() 
    try {
        await client.query('BEGIN');
        await interviewModel.modifyInterviewDate(jobId, seekerId, timestamp, client);
        const {name: recruiterName, company_id: companyId} = await interviewModel.getRecruiterNameAndCompanyId(recruiterId)
        const logs =  Kafka.produce({
            id: uuid(),
            performed_by: recruiterName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.modify_interview_date,
            created_at: new Date(),
        }, logs_topic)

        const dateUpdate = Kafka.produce({
            type: 2,
            jobId: jobId,
            companyId: companyId,
            jobSeeker: seekerId,
            deadline: timestamp
        }, emails_topic)
        await Promise.all([logs, dateUpdate])
        console.log('ack from kafka');
        await client.query('COMMIT');
        return {message: 'Interview date modified successfully'}

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    
}