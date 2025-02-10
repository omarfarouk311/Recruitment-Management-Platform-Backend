const invitationModel = require('./invitationModel');

exports.getInvitations = async (recruiterId, filters) => {
    const result = await invitationModel.getInvitations(recruiterId, filters);
    return result;
};
