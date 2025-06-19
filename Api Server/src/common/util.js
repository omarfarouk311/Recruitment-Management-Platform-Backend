const { validationResult, query, header } = require('express-validator');
const busboy = require('busboy');
const { client } = require('../../config/MinIO');
const { imagesBucketName, minLocationLength, maxLocationLength, fileSizeLimit, minNameLength,
    maxNameLength, cvsBucketName } = require('../../config/config');
const CV = require('../features/seekers/cvs/cvModel');

exports.validatePage = () => query('page')
    .isString()
    .withMessage('Invalid page number, it must be a positive number')
    .notEmpty()
    .withMessage('page parameter must be passed as a query parameter')
    .trim()
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage('Invalid page number, it must be a positive number')
    .toInt();

exports.validateRemote = () => query('remote')
    .optional()
    .isString()
    .withMessage('remote parameter value must be a string')
    .custom(value => value === 'true')
    .withMessage('remote parameter allowed value is true')
    .toBoolean();

exports.validateCountry = () => query('country')
    .optional()
    .isString()
    .withMessage('country parameter value must be a string')
    .isLength({ min: minLocationLength, max: maxLocationLength })
    .withMessage(`country parameter length must be between ${minLocationLength} and ${maxLocationLength}`);

exports.validateCity = () => query('city')
    .optional()
    .isString()
    .withMessage('city parameter value must be a string')
    .isLength({ min: minLocationLength, max: maxLocationLength })
    .withMessage(`city parameter length must be between ${minLocationLength} and ${maxLocationLength}`);

exports.validateIndustry = () => query('industry', 'Invalid industry id')
    .optional()
    .isString()
    .trim()
    .isInt({ min: 1, allow_leading_zeroes: false })
    .toInt();

exports.validateCompanyName = () => query('companyName')
    .optional()
    .isString()
    .withMessage('company parameter value must be a string')
    .isLength({ min: minNameLength, max: maxNameLength })
    .withMessage(`company parameter length must be between ${minNameLength} and ${maxNameLength}`);

exports.validateCompanyName = () => query('companyName')
    .optional()
    .isString()
    .withMessage('company parameter value must be a string')
    .isLength({ min: minNameLength, max: maxNameLength })
    .withMessage(`company parameter length must be between ${minNameLength} and ${maxNameLength}`);

exports.validateFileNameHeader = () => header('File-Name')
    .isString()
    .withMessage('file name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('file name length must be between 1 and 100 characters');

exports.handleValidationErrors = (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        err.validationErrors = Object.values(err.mapped()).map(({ msg }) => msg);
        err.msg = 'Validation Error';
        err.status = 400;
        return next(err);
    }

    next();
};

exports.multipartParser = () => {
    const fieldSizeLimit = 1024 * 50 /*50KB*/;

    // function that detaches streams, discards the rest of incoming request data, and forwards the error
    const handleError = (req, next, err) => {
        req.unpipe();
        req.resume();
        next(err);
    }

    // parsing middleware
    return (req, res, next) => {
        try {
            const bb = busboy({
                headers: req.headers,
                limits: {
                    fieldNameSize: 50,
                    fieldSize: fieldSizeLimit,
                    fields: 1,
                    fileSize: fileSizeLimit,
                    files: 3
                }
            });

            // parse expected files and upload it to the object store
            let cancel = false;
            bb.on('file', async (name, file, info) => {
                const { mimeType, filename } = info;
                const metadata = {
                    'content-type': mimeType,
                    filename
                };
                // image
                if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
                    const objectName = `${req.userRole}${req.userId}`;

                    file.on('limit', () => bb.removeAllListeners('finish'));

                    try {
                        await client.putObject(imagesBucketName, objectName, file, metadata);
                        if (file.truncated || cancel) {
                            await client.removeObject(imagesBucketName, objectName);
                        }
                        if (file.truncated && !cancel) {
                            const err = new Error(`image size has exceeded the limit of ${fileSizeLimit / 1048576}`);
                            err.msg = err.message;
                            err.status = 400;
                            return handleError(req, next, err);
                        }
                    }
                    catch (err) {
                        err.msg = `Error while uploading the image`;
                        err.status = 500;
                        return handleError(req, next, err);
                    }
                }

                // CV
                else if (mimeType === 'application/pdf') {
                    file.on('limit', () => bb.removeAllListeners('finish'));

                    try {
                        const cvId = await CV.getIdFromSequence();

                        req.cvId = cvId;
                        req.cvName = filename;
                        const objectName = cvId.toString();

                        await client.putObject(cvsBucketName, objectName, file, metadata);
                        if (file.truncated || cancel) {
                            await client.removeObject(cvsBucketName, objectName);
                        }
                        if (file.truncated && !cancel) {
                            const err = new Error(`CV size has exceeded the limit of ${fileSizeLimit / 1048576}`);
                            err.msg = err.message;
                            err.status = 400;
                            return handleError(req, next, err);
                        }
                    }
                    catch (err) {
                        err.msg = `Error while uploading the CV`;
                        err.status = 500;
                        return handleError(req, next, err);
                    }
                }
                else {
                    const err = new Error('Invalid mime type for the expected image file,it must be png or jpeg or jpg');
                    err.msg = err.message;
                    err.status = 400;
                    return handleError(req, next, err);
                }
            });

            // parse expected json field
            bb.on('field', (name, field, info) => {
                const { mimeType, valueTruncated } = info;

                try {
                    req.body = JSON.parse(field);
                    console.log(req.body);
                } catch (err) {
                    cancel = true;
                    const parseError = new Error(`Invalid JSON in ${name} field`);
                    parseError.msg = parseError.message;
                    parseError.status = 400;
                    return handleError(req, next, parseError);
                }
                if (mimeType !== 'application/json' && mimeType !== 'text/plain') {
                    cancel = true;
                    const err = new Error(`Invalid mime type for ${name} field, it must be json or plain text`);
                    err.msg = err.message;
                    err.status = 400;
                    return handleError(req, next, err);
                }

                if (valueTruncated) {
                    cancel = true
                    const err = new Error(`${name} field size exceeded the limit of ${fieldSizeLimit / 1024}kb`);
                    err.msg = err.message;
                    err.status = 400;
                    return handleError(req, next, err);
                }

            });

            bb.on('filesLimit', () => {
                cancel = true;
                const err = new Error('only 2 file is allowed to be uploaded');
                err.msg = err.message;
                err.status = 400;
                handleError(req, next, err);
            });

            bb.on('fieldsLimit', () => {
                cancel = true;
                const err = new Error('only one field is allowed to be sent');
                err.msg = err.message;
                err.status = 400;
                handleError(req, next, err);
            });

            bb.on('error', (err) => {
                handleError(req, next, err);
            });

            bb.on('finish', async () => {
                next();
            });

            req.pipe(bb);
        }
        catch (err) {
            err.msg = 'invalid multipart/form data, make sure headers and boundary are configured properly'
            err.status = 400;
            handleError(req, next, err);
        }
    }
};

exports.getImageService = async ({ bucketName, objectName }) => {
    const { metaData, size } = await client.statObject(bucketName, objectName);
    const stream = await client.getObject(bucketName, objectName);
    return { metaData, size, stream };
};

exports.uploadImageService = async ({ bucketName, objectName, mimeType, fileName, fileSize, dataStream }) => {
    if (mimeType !== 'image/png' && mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') {
        dataStream.resume();
        const err = new Error('Invalide file type while uploading the image');
        err.msg = 'Image type must be png, jpeg, or jpg';
        err.status = 400;
        throw err;
    }

    if (fileSize > fileSizeLimit) {
        dataStream.resume();
        const err = new Error(`Image size exceeded the limit of ${fileSizeLimit / 1048576}mb`);
        err.msg = err.message;
        err.status = 413;
        throw err;
    }

    // wrap the error event listener in a promise
    const streamErrorPromise = new Promise((resolve, reject) => {
        dataStream.on('error', async (err) => {
            try {
                await client.removeObject(bucketName, objectName, { forceDelete: true });
                err.msg = 'Error while uploading the Image';
                err.status = 500;
                reject(err);
            }
            catch (err) {
                err.msg = 'Error while uploading the Image';
                err.status = 500;
                reject(err);
            }
        });
    });

    await Promise.race([
        streamErrorPromise,
        client.putObject(bucketName, objectName, dataStream, fileSize, {
            'content-type': mimeType,
            filename: fileName
        })
    ]);
};