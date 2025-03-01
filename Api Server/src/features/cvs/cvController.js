const { fileSizeLimit } = require('../../../config/config');
const cvService = require('./cvService');

exports.parseCV = async (req, res, next) => {
    const mimetype = req.get('content-type');
    const fileSize = req.get('content-length');

    if (mimetype !== 'application/pdf') {
        req.resume();
        const err = new Error('Invalide file type while uploading the CV')
        err.msg = 'CV type must be pdf';
        err.status = 400;
        return next(err);
    }

    if (fileSize > fileSizeLimit) {
        req.resume();
        const err = new Error('Cv size exceeded the limit of 10mb')
        err.msg = err.message;
        err.status = 400;
        return next(err);
    }

    req.on('error', () => {
        const err = new Error('Error while uploading the CV');
        err.msg = err.message;
        err.status = 500;
        next(err);
    });

    try {
        const parsedCV = await cvService.parseCV(req);
        res.type('json').status(201).send(parsedCV);
    }
    catch (err) {
        next(err);
    }
};