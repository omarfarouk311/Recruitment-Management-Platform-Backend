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

exports.getReports = async (req, res, next) => {
    const { userId, query } = req;

    try {
        const reports = await reportService.getReports(userId, query);
        res.status(200).json(reports);
    }
    catch (err) {
        next(err);
    }
};
