const invitationModel = require('./invitationModel');

exports.getInvitations = async (userId, userRole, filters) => {
    const result = await invitationModel.getInvitations(userId, userRole, filters);
    return result;
};
