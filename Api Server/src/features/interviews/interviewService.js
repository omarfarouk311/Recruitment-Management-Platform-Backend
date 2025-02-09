const interviewModel = require('./interviewModel')
const Pool = require('../../../config/db')
const Kafka = require('../../common/kafka')
const { action_types, logs_topic } = require('../../../config/config')
const { v6: uuid } = require('uuid');


module.exports.getRecruiterInterviewsData = async (id, filters) => {
    const { page, title, sort } = filters;
    const interviews = await interviewModel.getRecruiterInterviewsData(id, page, title, sort);
    return interviews;
}


module.exports.modifyInterviewDate = async (recruiterId, jobId, seekerId, timestamp) => {

    // start the transaction here, as we will add the email functionality and will wait until we get ack from kafka
    const client = await Pool.getWritePool().connect() 
    try {
        await client.query('BEGIN');
        await interviewModel.modifyInterviewDate(jobId, seekerId, timestamp, client);
        const {name: recruiterName, company_id: companyId} = await interviewModel.getRecruiterNameAndCompanyId(recruiterId)
        await Kafka.produce({
            id: uuid(),
            performed_by: recruiterName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.modify_interview_date,
            created_at: new Date(),
        }, logs_topic)
        console.log('ack from kafka');
        // produce to mailjet topic using the template
        await client.query('COMMIT');
        return {message: 'Interview date modified successfully'}

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    
}