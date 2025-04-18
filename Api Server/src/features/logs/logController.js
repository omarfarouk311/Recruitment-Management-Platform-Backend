const logService = require('./logService');

exports.getLogs = async (req, res, next) => {
    const { userId, query } = req;

    try {
        const result = await logService.getLogs(userId, query);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};


exports.getActions = async (req, res, next) => {
    try {
        const actions = await logService.getActions();
        res.status(200).json(actions);
    }
    catch (err) {
        next(err);
    }
};