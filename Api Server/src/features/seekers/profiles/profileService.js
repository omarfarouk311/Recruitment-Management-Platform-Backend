const { ProfileModel } = require('./profileModel');

exports.getProfile = async (userId) => {
    const profile = await ProfileModel.getProfile(userId);
    return profile;
}

exports.updateProfile = async (userId, profileData) => {
    const updatedProfile = await ProfileModel.updateProfile(userId, profileData);
    return updatedProfile;
}