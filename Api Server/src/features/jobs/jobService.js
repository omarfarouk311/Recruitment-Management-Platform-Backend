const jobModel = require('./jobModel')
const Kafka = require('../../common/kafka')
const {  job_embedding_topic, logs_topic, action_types } = require('../../../config/config')
const { v6: uuid } = require('uuid');
const Pool = require('../../../config/db')


const produceToKafka = async (processObject, topicName) => {
    await Kafka.produce(processObject, topicName);
};

module.exports.createJob = async (companyId, jobData) => {
    const client = await Pool.getWritePool().connect();
    try {
        await client.query('BEGIN');

        const response = await jobModel.createJob(client, companyId, jobData);
        const companyName = await jobModel.getCompanyName(companyId);
        const { message, jobId } = response;

        const processObject = {
            id: uuid(),
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.create_job,
            created_at: new Date(),
        };

        await produceToKafka({ jobId }, job_embedding_topic);
        await produceToKafka(processObject, logs_topic);

        await client.query('COMMIT');
        console.log('Ack from Kafka');
        return message;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in createJob:', error);
        throw error;
    } finally {
        client.release();
    }
};



module.exports.getAllCompanyJobs = async (companyId, filters) => {
    const jobs = await jobModel.getAllCompanyJobs(companyId, filters)
    return jobs
}

module.exports.getJobDetailsById = async (jobId, userId, userRole) => {
    const job = await jobModel.getJobDetailsById(jobId, userId, userRole)
    return job
}

module.exports.closeJobById = async (companyId, jobId) => {
    const client = await Pool.getWritePool().connect();
    try {
        await client.query('BEGIN');

        await jobModel.closeJobById(client, companyId, jobId);
        const companyName = await jobModel.getCompanyName(companyId);

        const processObject = {
            id: uuid(),
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.close_job,
            created_at: new Date(),
        };

        await produceToKafka(processObject, logs_topic);

        await client.query('COMMIT');
        console.log('Ack from Kafka');
        return { message: 'Job closed successfully' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteJobById:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports.updateJobById = async (companyId, jobId, jobData) => {
    const client = await Pool.getWritePool().connect();

    try {
        await client.query('BEGIN');

        await jobModel.updateJobById(client, companyId, jobId, jobData);
        const companyName = await jobModel.getCompanyName(companyId);
        const processObject = {
            id: uuid(),
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.update_job,
            created_at: new Date(),
        };

        await produceToKafka({ jobId }, job_embedding_topic);
        await produceToKafka(processObject, logs_topic);

        await client.query('COMMIT');
        console.log('Ack from Kafka');

        return { message: 'Job updated successfully' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in updateJobById:', error);
        throw error;
    } finally {
        client.release();
    }
};


module.exports.getJobDataForEditing = async (jobId) => {
    const job = await jobModel.getJobDataForEditing(jobId)
    return job
}



module.exports.getSimilarJobs = async (jobId) => {
    const jobs = await jobModel.getSimilarJobs(jobId)
    return jobs
}