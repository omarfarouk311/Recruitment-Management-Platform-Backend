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
        if (!result.length) return res.status(404).json({ message: 'Company not found' });
        return res.status(200).json(result);
    }
    catch (err) {
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
    const { userRole } = req

    try {
        const result = await companyService.getCompanyJobs(companyId, filters, userRole);
        return res.status(200).json(result);
    }
    catch (err) {
        passError(err, next);
    }
};