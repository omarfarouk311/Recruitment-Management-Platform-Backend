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


exports.getCvName = async (req, res, next) => { 
    const { jobId, seekerId } = req.query;
    const { userId, userRole } = req;

    try {
        const cvs = await cvService.getCvName(jobId, seekerId, userId, userRole);
        return res.status(200).json({ cvNames: cvs });
    } catch (err) {
        next(err);
    }
}

exports.downloadCV = async (req, res, next) => {
    const { cvId } = req.params;
    const { userId, userRole } = req;
    const { seekerId, jobId } = req.query;

    try {
        const { metaData, size, stream } = await cvService.downloadCV(cvId, userId, userRole, seekerId, jobId);

        // set response headers to allow the browser to display the file in the browser
        res.setHeader("Content-Type", metaData['content-type']);
        res.setHeader("Content-Length", size);
        res.setHeader("Content-Disposition", `inline; filename="${metaData['filename']}"`);

        stream.pipe(res);

        stream.on("error", (err) => {
            next(err);
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteCV = async (req, res, next) => {
    const { cvId } = req.params;
    const { userId } = req;

    try {
        const msg = await cvService.deleteCV(cvId, userId);
        console.log('CV deleted successfully');
        res.status(200).json({ msg });
    } catch (err) {
        next(err);
    }
}



exports.getCvsForJob = async (req, res, next) => {
    const { jobId } = req.params;
    const { userId: seekedId } = req;
    try {
        const cvs = await cvService.getCvsForJob(jobId, seekedId);
        return res.status(200).json({ cvs });
    } catch (err) {
        next(err);
    }
}