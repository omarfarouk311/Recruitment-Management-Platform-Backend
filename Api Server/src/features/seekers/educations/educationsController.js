const educationService = require('./educationsService')

module.exports.addEducationController = async (req, res, next) => {
    try {
        let userId = req.userId;
        let { school_name, field, degree, grade, start_date, end_date } = req.body;
        let id = await educationService.addEducationService(userId, school_name, field, degree, grade, start_date, end_date);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
}

module.exports.getEducationController = async (req, res, next) => {
    try {
        let seekerId = req.params.seekerId
        let result = await educationService.getEducationService(seekerId);

        res.status(200).json({
            success:true,
            education:result
        })

    } catch (err) {
        next(err);
    }
}

module.exports.deleteEducationController = async (req, res, next) => {
    try {
        let educationId = req.params.educationId;
        let seekerId = req.userId;
        await educationService.deleteEducationService(educationId, seekerId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports.editEducationController = async (req, res, next) => {
    try {
        let seekerId = req.userId;
        let educationId = req.params.educationId;
        let { school_name, field, degree, grade, start_date, end_date } = req.body;
        await educationService.editEducationService(seekerId, educationId, school_name, field, degree, grade, start_date, end_date);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
}