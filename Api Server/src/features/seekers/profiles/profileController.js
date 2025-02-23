const profileService = require('./profileService');

exports.getProfile = async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(req.params.userId);
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}

exports.updateProfile = async (req, res, next) => {
    try {
        const profile = await profileService.updateProfile(req.userId, req.body);
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}