const educationModel = require('./educationsModel');

exports.authUpdateEducation = async (req, res, next) => {
    try {
        const educationId = req.params.educationId;
        const userId = req.userId;
        const ownerId = await educationModel.getEducationOwner(educationId);
        if (!ownerId || ownerId !== userId) {
            const err = new Error('Unauthorized Access on education update');
            err.msg = 'Unauthorized Access!';
            err.status = 403;
            throw err;
        }

        next();
    }
    catch (err) {
        next(err);
    }
};

exports.authDeleteEducation = async (req, res, next) => {
    try {
        const educationId = req.params.educationId;
        const userId = req.userId;
        const ownerId = await educationModel.getEducationOwner(educationId);
        if (!ownerId || ownerId !== userId) {
            const err = new Error('Unauthorized Access on education delete');
            err.msg = 'Unauthorized Access!';
            err.status = 403;
            throw err;
        }

        next();
    }
    catch (err) {
        next(err);
    }
};