const logService = require('./logService');

exports.getLogs = async (req, res, next) => {
    const { userId: companyId } = req;
    const { query: filters } = req;

    try {
        const result = await logService.getLogs(companyId, filters);
        return res.status(200).json(result);
    }
    catch (err) {
        err.status = 500;
        err.msg = 'Internal server error';
        return next(err);
    }
};
