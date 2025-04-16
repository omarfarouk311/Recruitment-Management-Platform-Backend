const Job = require('./jobModel');
const { emails_topic } = require('../../../../config/config');
const { produce } = require('../../../common/kafka');

exports.getRecommendedJobs = (data) => {
    const { seekerId, filters } = data;
    return Job.getRecommendedJobs(seekerId, filters);
};

exports.getSearchedJobs = (data) => {
    const { filters } = data;
    return Job.getSearchedJobs(filters);
};

exports.applyToJob = (data) => {
    const { seekerId, cvId, jobId } = data;

    const kafkaProduce = async (seekerEmailData, companyEmailData) => {
        const promises = [];
        // notify the seeker that he has been progressed to the first phase
        promises.push(produce(seekerEmailData, emails_topic));
        // notify the company that the job has been closed if the applicants limit is reached
        if (companyEmailData) {
            promises.push(produce(companyEmailData, emails_topic));
        }
        await Promise.all(promises);
    }

    return Job.apply(seekerId, cvId, jobId, kafkaProduce);
}

exports.removeRecommendation = (data) => {
    const { seekerId, jobId } = data;
    return Job.removeRecommendation(seekerId, jobId);
}