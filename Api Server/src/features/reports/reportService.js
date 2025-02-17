const Report = require('./reportModel');

exports.createReport = async ({ jobId, title, description }, creatorId) => {
    const report = new Report(jobId, creatorId, new Date(), title, description);
    await report.create();
};
