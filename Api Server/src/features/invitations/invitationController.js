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

exports.sendInvitation = async (req, res, next) => {
    const { recruiterEmail, department, deadline } = req.body;
    const { userId } = req;

    try {
        await invitationService.createInvitation(recruiterEmail, userId, department, deadline);
        res.status(201).send();
    }
    catch (err) {
        next(err);
    }
};
