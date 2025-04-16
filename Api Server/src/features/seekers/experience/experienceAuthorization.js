const experienceModel = require('./experienceModel');

exports.authUpdateExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        const userId = req.userId;

        const experience = await experienceModel.getExperienceById(experienceId);
        if (!experience || experience.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }

        next();
    } catch (error) {
        console.error("Error in authUpdateExperience middleware", error);
        next(error);
    }
};

exports.authDeleteExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        const userId = req.userId;

        const experience = await experienceModel.getExperienceById(experienceId);
        if (!experience || experience.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }

        next();
    } catch (error) {
        console.error("Error in authDeleteExperience middleware", error);
        next(error);
    }
};