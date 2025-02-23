const experienceService = require('./experienceService');

exports.getAllExperiences = async (req, res, next) => {
    try {
        const userId = req.userId;
        const experiences = await experienceService.getAllExperiences(userId);
        res.status(200).json(experiences);
    } catch (error) {
        next(error);
    }
};

exports.addExperience = async (req, res, next) => {
    try {
        const experienceData = {
            userId: req.userId,
            companyName: req.body.companyName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            description: req.body.description,
            jobTitle: req.body.jobTitle,
            country: req.body.country,
            city: req.body.city
        };
        const experience = await experienceService.addExperience(experienceData);
        res.status(201).json(experience);
    } catch (error) {
        next(error);
    }
};

exports.updateExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        const experienceData = {
            companyName: req.body.companyName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            description: req.body.description,
            jobTitle: req.body.jobTitle,
            country: req.body.country,
            city: req.body.city
        };
        const experience = await experienceService.updateExperience(experienceId, experienceData);
        res.status(200).json(experience);
    } catch (error) {
        next(error);
    }
};

exports.deleteExperience = async (req, res, next) => {
    try {
        const experienceId = req.params.experienceId;
        await experienceService.deleteExperience(experienceId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};