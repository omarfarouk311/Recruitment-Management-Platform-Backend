const { JobOfferModel } = require('./jobOfferModel');
const constants = require('../../../../config/config');
const { produce } = require('../../../common/kafka');
const { CandidateModel } = require('../../candidates/candidateModel');
const { getWritePool } = require('../../../../config/db');


exports.getJobOffers = async (userId, status, country, city, companyId, sort, page) => {
    let offset = (page - 1) * constants.pagination_limit;
    return await JobOfferModel.getJobOffers(userId, status, country, city, companyId, sort, offset);
};

exports.getJobOffer = async (userId, jobId) => {
    let result = await JobOfferModel.getJobOffer(userId, jobId);
    result.offer = result.offer.replace(/{{(.+?)}}/g, (match, p1) => {
        return result.placeholdersParams[p1] || match;
    });
    return result;
}

exports.replyToJobOffer = async (userId, jobId, status) => {
    const client = await getWritePool().connect();
    let result = await CandidateModel.moveCandidatesToHistory([userId], jobId, status, client);
    try {
        let companyId = await JobOfferModel.getCompanyId(jobId);
        if (result.updatedCandidates && result.updatedCandidates.length) {
            delete result.client;
            produce({
                jobId: jobId,
                companyId: companyId,
                jobSeeker: userId,
                type: constants.email_types.job_offer_acceptance,
                rejected: !status
            }, constants.emails_topic);
            client.query('COMMIT;')
            return result;
        }
        client.query('COMMIT;')
        return false;
    } catch(error) {
        client.query('ROLLBACK;')
        throw error;
    } finally {
        client.release();
    }
}

exports.getCompanyNames = async (userId, status) => {
    return await JobOfferModel.getCompanyNames(userId, status);
};