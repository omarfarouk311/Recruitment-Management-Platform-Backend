const profileService = require('./profileService');
const { getImageService, uploadImageService } = require('../../../common/util');
const { imagesBucketName, role } = require('../../../../config/config');

exports.getProfile = async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(req.params.seekerId)
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}

exports.updateProfile = async (req, res, next) => {
    try {
        await profileService.updateProfile(req.userId, req.body);
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
}

exports.finishProfile = async (req, res, next) => {
    const data = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        experiences: req.body.experiences,
        educations: req.body.educations,
        skills: req.body.skills,
        cvId: req.cvId,
        cvName: req.cvName,
    };
    console.log('finishProfile', data);
    try {
        await profileService.finishProfile(req.userId, data);
        res.status(201).end();
    } catch (error) {
        next(error);
    }
}

exports.getProfileImage = async (req, res, next) => {
    const { seekerId } = req.params;
    const imageData = {
        bucketName: imagesBucketName,
        objectName: `${role.jobSeeker}${seekerId || req.userId}`
    };

    try {
        const {
            metaData: { 'content-type': contentType, filename: fileName },
            size,
            stream
        } = await getImageService(imageData);

        res.header({
            'Content-Type': contentType,
            'Content-Length': size,
            'Content-Disposition': `inline; filename = ${fileName}`
        }).status(200);

        stream.on('error', (err) => next(err));
        stream.pipe(res);
    }
    catch (err) {
        if (err.code === 'NotFound') {
            err.msg = 'Seeker photo not found';
            err.status = 404;
        }
        next(err);
    }
};

exports.uploadProfileImage = async (req, res, next) => {
    const uploadedImageData = {
        objectName: `${role.jobSeeker}${req.userId}`,
        bucketName: imagesBucketName,
        fileName: req.get('file-name'),
        fileSize: req.get('content-length'),
        mimeType: req.get('content-type'),
        dataStream: req
    };

    try {
        await uploadImageService(uploadedImageData);

        return res.sendStatus(200)
    }
    catch (err) {
        next(err);
    }
};