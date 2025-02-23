const companyService = require('./companyService');
const { getPhotoService } = require('../../common/util');
const { imagesBucketName } = require('../../../config/config');

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

exports.getCompanyPhoto = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const {
            metaData: { 'content-type': contentType, filename: fileName },
            size,
            stream
        } = await getPhotoService(imagesBucketName, `company${companyId}`);

        res.header({
            'Content-Type': contentType,
            'Content-Length': size,
            'Content-Disposition': `inline; filename = ${fileName}`
        });

        stream.on('error', (err) => passError(err, next));
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