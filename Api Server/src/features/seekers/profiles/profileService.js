const { ProfileModel } = require('./profileModel');

exports.getProfile = async (userId) => {
    const profile = await ProfileModel.getProfile(userId);
    return profile;
}

exports.updateProfile = async (userId, profileData) => {
    const updatedProfile = await ProfileModel.updateProfile(userId, profileData);
    return updatedProfile;
}

exports.finishProfile = async (userId, profileData) => {
    try {
        await ProfileModel.insertProfile(userId, profileData);
    }
    catch (err) {
        if (err.code === '23505') {
            if (err.constraint === 'job_seeker_phone_number_key') {
                err.msg = 'Phone number already exists';
            }
            else {
                err.msg = 'Profile already exists';
            }
            err.status = 409;
        }
        throw err;
    }
}