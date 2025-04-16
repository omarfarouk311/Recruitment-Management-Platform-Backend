const invitationModel = require('./invitationModel');
const { produce } = require('../../common/kafka');
const { logs_topic, emails_topic, action_types: { send_invitation },
    email_types: { company_invitation } } = require('../../../config/config');
const { v6: uuidv6 } = require('uuid');

exports.getInvitations = (userId, userRole, filters) => {
    return invitationModel.getInvitations(userId, userRole, filters);
};

exports.createInvitation = async (recruiterEmail, companyId, department, deadline) => {
    const createdAt = new Date(), id = uuidv6();

    const kafkaProduce = async (companyName, recruiterId) => {
        // produced message into logs topic
        const logData = {
            type: 1,
            id,
            performed_by: companyName,
            company_id: companyId,
            created_at: createdAt,
            extra_data: {
                to: recruiterEmail
            },
            action_type: send_invitation
        }
        // produced message into emails topic
        const emailData = {
            type: company_invitation,
            recruiterId,
            companyId: companyId,
            department: department,
            deadline: deadline
        }
        // produce messages into their topics
        await Promise.all[produce(logData, logs_topic), produce(emailData, emails_topic)];
    }

    const invitation = new invitationModel(recruiterEmail, companyId, department, createdAt, deadline);
    try {
        const invitationId = await invitation.create(kafkaProduce);
        return invitationId;
    }
    catch (err) {
        // produce a message to remove the log in case of an error during committing the transaction
        if (err.removeLog) {
            await produce({ type: 0, id }, logs_topic);
        }
        throw err;
    }
};

exports.replyToInvitation = (invitationId, recruiterId, status, date) => {
    return invitationModel.replyToInvitation(invitationId, recruiterId, status, date);
};