const { role: { company } } = require('../../../config/config');

exports.authorizeUpdateCompanyData = (req, res, next) => {
    const { userRole } = req;

    if (userRole !== company) {
        const err = new Error('Unauthorized access on updating company data');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};

exports.authorizeUploadCompanyImage = (req, res, next) => {
    const { userId, userRole, params: { companyId } } = req;

    if (userId !== companyId || userRole !== company) {
        const err = new Error('Unauthorized access on uploading company image');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};