const invitationService = require('./invitationService');

exports.getInvitations = async (req, res, next) => {
    const { userId } = req;
    const { query: filters } = req;

    try {
        const result = await invitationService.getInvitations(userId, filters);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
