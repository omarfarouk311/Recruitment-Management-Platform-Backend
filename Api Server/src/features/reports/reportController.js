const reportService = require('./reportService');

exports.createReport = async (req, res, next) => {
    const data = {
        title: req.body.title,
        description: req.body.description,
        jobId: req.body.jobId,
        creatorId: req.userId,
    };

    try {
        await reportService.createReport(data);
        res.status(201).send();
    }
    catch (err) {
        next(err);
    }
};

exports.getReports = async (req, res, next) => {
    const data = {
        userId: req.userId,
        filters: req.query
    };

    try {
        const reports = await reportService.getReports(data);
        res.status(200).json(reports);
    }
    catch (err) {
        next(err);
    }
};
