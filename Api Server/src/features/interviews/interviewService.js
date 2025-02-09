const interviewModel = require('./interviewModel')

module.exports.getRecruiterInterviewsData = async (id, filters) => {
    const { page, title, sort } = filters;
    const interviews = await interviewModel.getRecruiterInterviewsData(id, page, title, sort);
    return interviews;
}