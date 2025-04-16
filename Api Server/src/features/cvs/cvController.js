const cvService = require('./cvService');

exports.parseCV = async (req, res, next) => {
    const cvData = {
        mimeType: req.get('content-type'),
        fileSize: req.get('content-length'),
        dataStream: req
    }

    try {
        const parsedCV = await cvService.parseCV(cvData);
        res.type('json').status(201).send(parsedCV);
    }
    catch (err) {
        next(err);
    }
};