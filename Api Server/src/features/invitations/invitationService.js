const invitationModel = require('./invitationModel');

exports.getInvitations = async (userId, userRole, filters) => {
    const result = await invitationModel.getInvitations(userId, userRole, filters);
    return result;
};

exports.createInvitation = async (recruiterEmail, companyId, department, deadline) => {
    const invitation = new invitationModel(recruiterEmail, companyId, department, new Date(), deadline, 2);
    await invitation.create();
};

exports.replyToInvitation = async (recruiterId, companyId, status, date) => {
    await invitationModel.replyToInvitation(recruiterId, companyId, status, date);
};
