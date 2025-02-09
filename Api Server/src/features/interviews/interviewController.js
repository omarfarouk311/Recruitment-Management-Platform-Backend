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

