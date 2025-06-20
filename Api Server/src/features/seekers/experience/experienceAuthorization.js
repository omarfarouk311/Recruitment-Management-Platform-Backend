const experienceModel = require('./experienceModel');

exports.authUpdateExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        const userId = req.userId;
        const ownerId = await experienceModel.getExperienceOwner(experienceId);
        if (!ownerId || ownerId !== userId) {
            const err = new Error('Unauthorized Access on experience update');
            err.msg = 'Unauthorized Access!';
            err.status = 403;
            throw err;
        }

        next();
    } catch (error) {
        next(error);
    }
};

exports.authDeleteExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        const userId = req.userId;
        const ownerId = await experienceModel.getExperienceOwner(experienceId);
        if (!ownerId || ownerId !== userId) {
            const err = new Error('Unauthorized Access on experience delete');
            err.msg = 'Unauthorized Access!';
            err.status = 403;
            throw err;
        }

        next();
    } catch (error) {
        next(error);
    }
};