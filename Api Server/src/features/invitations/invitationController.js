const invitationService = require('./invitationService');

exports.getInvitations = async (req, res, next) => {
    const { userId, userRole } = req;
    const { query: filters } = req;

    try {
        const result = await invitationService.getInvitations(userId, userRole, filters);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
