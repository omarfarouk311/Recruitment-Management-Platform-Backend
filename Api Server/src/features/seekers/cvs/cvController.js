const cvService = require('./cvService');

exports.uploadCV = async (req, res, next) => {
    const cvData = {
        seekerId: req.userId,
        fileName: req.get('file-name'),
        fileSize: req.get('content-length'),
        mimeType: req.get('content-type'),
        dataStream: req
    };

    try {
        await cvService.uploadCV(cvData);
        res.status(201).send();
    }
    catch (err) {
        next(err);
    }
};