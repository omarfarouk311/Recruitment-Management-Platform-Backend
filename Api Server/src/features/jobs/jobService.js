const jobModel = require('./jobModel')
const Kafka = require('../../common/kafka')
const { job_embedding_topic, logs_topic, action_types } = require('../../../config/config')
const { v6: uuid } = require('uuid');
const Pool = require('../../../config/db')


const produceToKafka = async (processObject, topicName) => {
    await Kafka.produce(processObject, topicName);
};

module.exports.createJob = async (companyId, jobData) => {
    const client = await Pool.getWritePool().connect();
    try {
        await client.query('BEGIN');

        const jobId = await jobModel.createJob(client, companyId, jobData);
        const companyName = await jobModel.getCompanyName(companyId);
        const id = uuid();
        const processObject = {
            id,
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.create_job,
            created_at: new Date(),
        };

        await produceToKafka({ jobId }, job_embedding_topic);
        await produceToKafka(processObject, logs_topic);
        try {
            await client.query('COMMIT');
        } catch (err) {
            await produceToKafka({ id, type: 0 }, logs_topic);
            throw err;
        }

        return jobId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports.getJobDetailsById = async (jobId, userId, userRole) => {
    const job = await jobModel.getJobDetailsById(jobId, userId, userRole)
    return job
}

module.exports.closeJobById = async (companyId, jobId) => {
    const client = await Pool.getWritePool().connect();
    try {
        await client.query('BEGIN');

        await jobModel.closeJobById(client, jobId);
        const companyName = await jobModel.getCompanyName(companyId);
        const id = uuid();
        const processObject = {
            id,
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.close_job,
            created_at: new Date(),
        };

        await produceToKafka(processObject, logs_topic);

        try {
            await client.query('COMMIT');
        } catch (err) {
            await produceToKafka({ id, type: 0 }, logs_topic);
            throw err;
        }
        return { message: 'Job closed successfully' };
    } catch (error) {
        await client.query('ROLLBACK');
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
        const id = uuid();
        const processObject = {
            id,
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.update_job,
            created_at: new Date(),
        };

        await produceToKafka({ jobId }, job_embedding_topic);
        await produceToKafka(processObject, logs_topic);

        try {
            await client.query('COMMIT');
        } catch (err) {
            await produceToKafka({ id, type: 0 }, logs_topic);
            throw err;
        }

        return { message: 'Job updated successfully' };
    } catch (error) {
        await client.query('ROLLBACK');
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