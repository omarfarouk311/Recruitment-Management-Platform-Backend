const companyService = require('./companyService');
const { getImageService, uploadImageService } = require('../../common/util');
const { imagesBucketName, role } = require('../../../config/config');

exports.getCompanyData = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyData(companyId);
        res.status(200).json(result[0]);
    }
    catch (err) {
        next(err);
    }
};

exports.getCompanyLocations = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyLocations(companyId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};

exports.getCompanyIndustries = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyIndustries(companyId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};

exports.getCompanyJobs = async (req, res, next) => {
    const { companyId } = req.params;
    const filters = req.query;
    const { userId } = req;

    try {
        const result = await companyService.getCompanyJobs(companyId, filters, userId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};

exports.updateCompanyData = async (req, res, next) => {
    const { userId, body } = req;

    try {
        await companyService.updateCompanyData(userId, body);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};

exports.getCompanyImage = async (req, res, next) => {
    const { companyId } = req.params;
    const imageData = {
        bucketName: imagesBucketName,
        objectName: `${role.company}${companyId}`
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
            err.msg = 'Company photo not found';
            err.status = 404;
        }
        next(err);
    }
};

exports.uploadCompanyImage = async (req, res, next) => {
    const uploadedImageData = {
        objectName: `${role.company}${req.userId}`,
        bucketName: imagesBucketName,
        fileName: req.get('file-name'),
        fileSize: req.get('content-length'),
        mimeType: req.get('content-type'),
        dataStream: req
    };

    const retrievedImageData = {
        objectName: `${role.company}${req.userId}`,
        bucketName: imagesBucketName
    };

    try {
        await uploadImageService(uploadedImageData);

        //retrieve the image after uploading to return it in the response for Nginx caching
        const {
            metaData: { 'content-type': contentType, filename: fileName },
            size,
            stream
        } = await getImageService(retrievedImageData);

        res.header({
            'Content-Type': contentType,
            'Content-Length': size,
            'Content-Disposition': `inline; filename = ${fileName}`,
        }).status(201);

        stream.on('error', (err) => next(err));
        stream.pipe(res);
    }
    catch (err) {
        next(err);
    }
};