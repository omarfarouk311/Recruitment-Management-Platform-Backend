const statsService = require('./statsService');

exports.getStats = async (req, res, next) => {
    const { userId } = req;

    try {
        const stats = await statsService.getStats(userId);
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
};