const reportService = require('./reportService');

exports.createReport = async (req, res, next) => {
    const { body, userId } = req;

    try {
        await reportService.createReport(body, userId);
        res.status(201).send();
    }
    catch (err) {
        next(err);
    }
};
