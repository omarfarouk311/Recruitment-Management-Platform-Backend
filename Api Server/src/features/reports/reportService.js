const Report = require('./reportModel');

exports.createReport = (data) => {
    const { jobId, creatorId, title, description } = data;

    const report = new Report({
        jobId,
        creatorId,
        title,
        description,
        createdAt: new Date()
    });

    return report.create();
};

exports.getReports = (data) => {
    const { userId, filters } = data;
    return Report.getReports(userId, filters);
};