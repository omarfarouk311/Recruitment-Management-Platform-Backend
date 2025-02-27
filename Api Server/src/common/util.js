const { validationResult, query } = require('express-validator');
const busboy = require('busboy');
const { client } = require('../../config/MinIO');
const { imagesBucketName, cvsBucketName, minLocationLength, maxLocationLength, minIndustryLength,
    maxIndustryLength } = require('../../config/config');

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

exports.validateIndustry = () => query('industry')
    .optional()
    .isString()
    .withMessage('industry parameter must be a string')
    .trim()
    .isLength({ min: minIndustryLength, max: maxIndustryLength })
    .withMessage(`industry parameter length must be between ${minIndustryLength} and ${maxIndustryLength}`);

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

exports.multipartParser = (mediaType) => {
    const fileSizeLimit = 1048576 * 5 /*5MB*/, fieldSizeLimit = 1024 * 50 /*50KB*/;

    // function that detaches streams, discards the rest of incoming request data, and forwards the error
    const handleError = (req, next, err) => {
        req.unpipe();
        req.resume();
        next(err);
    }

    // parsing middleware
    return (req, res, next) => {
        // validate passed mediaType parameter
        if (mediaType !== 'image') {
            const err = new Error('Invalid media type parameter passed to the parser function, it must be image');
            err.msg = 'Internal server error'
            err.status = 500;
            return handleError(req, next, err);
        }

        try {
            const bb = busboy({
                headers: req.headers,
                limits: {
                    fieldNameSize: 50,
                    fieldSize: fieldSizeLimit,
                    fields: 1,
                    fileSize: fileSizeLimit,
                    files: 1
                }
            });

            // parse expected file and upload it to the object store
            let cancel = false, image = false;
            bb.on('file', async (name, file, info) => {
                const { mimeType, filename } = info;
                const metadata = {
                    'content-type': mimeType,
                    filename
                };

                // image
                if (mediaType === 'image') {
                    image = true;
                    const objectName = `${req.userRole}${req.userId}`;

                    if (mimeType !== 'image/png' && mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') {
                        const err = new Error('Invalid mime type for the expected image file,it must be png or jpeg or jpg');
                        err.msg = err.message;
                        err.status = 400;
                        return handleError(req, next, err);
                    }

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
            });

            // parse expected json field
            bb.on('field', (name, field, info) => {
                const { mimeType, valueTruncated } = info;

                if (mimeType !== 'application/json') {
                    cancel = true;
                    const err = new Error(`Invalid mime type for ${name} field, it must be json`);
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

                req.body = JSON.parse(field);
            });

            bb.on('filesLimit', () => {
                cancel = true;
                const err = new Error('only one file is allowed to be uploaded');
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
                try {
                    if (!image) {
                        await client.removeObject(imagesBucketName, `${req.userRole}${req.userId}`);
                    }
                }
                catch (err) {
                    return next(err);
                }

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

exports.getPhotoService = async (bucketName, objectName) => {
    const { metaData, size } = await client.statObject(bucketName, objectName);
    const stream = await client.getObject(bucketName, objectName);
    return { metaData, size, stream };
};
