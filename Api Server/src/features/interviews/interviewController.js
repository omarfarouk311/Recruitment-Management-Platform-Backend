const interviewService = require('./interviewService')

module.exports.getRecruiterInterviewsData = async (req, res, next) => {
    const userId = req.userId;
    const filters = req.query;
    try {
        const interviews = await interviewService.getRecruiterInterviewsData(userId, filters);
        res.status(200).json({ interviews });
    } catch (err) {
        next(err);
    }
}


module.exports.modifyInterviewDate = async (req, res, next) => {
    const { jobId, seekerId } = req.params
    const { timestamp } = req.body;
    try {
        const response = await interviewService.modifyInterviewDate(req.userId, jobId, seekerId, timestamp);
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}

module.exports.getSeekerInterviewsData = async (req, res, next) => {
    const userId = req.userId;
    const filters = req.query;
    try {
        const interviews = await interviewService.getSeekerInterviewsData(userId, filters);
        res.status(200).json({ interviews });
    } catch (err) {
        next(err);
    }
}