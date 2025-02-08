const companyService = require('./companyService');

function passError(err, next) {
    err.status = 500;
    err.msg = 'Internal server error';
    next(err);
}

exports.getCompanyData = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyData(companyId);
        return res.status(200).json(result[0]);
    }
    catch (err) {
        if (err.msg) {
            return next(err);
        }
        passError(err, next);
    }
};

exports.getCompanyLocations = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyLocations(companyId);
        return res.status(200).json(result);
    }
    catch (err) {
        passError(err, next);
    }
};

exports.getCompanyIndustries = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyIndustries(companyId);
        return res.status(200).json(result);
    }
    catch (err) {
        passError(err, next);
    }
};

exports.getCompanyJobs = async (req, res, next) => {
    const { companyId } = req.params;
    const filters = req.query;
    const { userRole } = req;

    try {
        const result = await companyService.getCompanyJobs(companyId, filters, userRole);
        return res.status(200).json(result);
    }
    catch (err) {
        passError(err, next);
    }
};

exports.updateCompanyData = async (req, res, next) => {
    const { userId: companyId, body: data } = req;

    try {
        await companyService.updateCompanyData(companyId, data);
        res.status(204).send();
    }
    catch (err) {
        if (err.msg) {
            return next(err);
        }
        passError(err, next);
    }
};

exports.getCompanyPhoto = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const {
            stat: {
                metaData: {
                    'content-type': contentType,
                    filename: fileName
                },
                size
            },
            stream
        } = await companyService.getCompanyPhoto(companyId);

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
            return next(err);
        }
        passError(err, next);
    }
};