const { TemplateAuthorization } = require('./templateModel');

exports.authCreateTemplate = (req, res, next) => {
    if (!TemplateAuthorization.isCompanyUser(req)) {
        return res.status(403).json({ message: 'Unauthorized Access!' });
    }
    next();
};

exports.authUpdateTemplate = async (req, res, next) => {
    try {
        const hasPerm = await TemplateAuthorization.hasPermission(req.params.id, req.user.company_id);
        if (!hasPerm) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }
        next();
    } catch (error) {
        console.error("Error in authUpdateTemplate middleware", error);
        next(error);
    }
};

exports.authDeleteTemplate = async (req, res, next) => {
    try {
        const hasPerm = await TemplateAuthorization.hasPermission(req.params.id, req.user.company_id);
        if (!hasPerm) {
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }
        next();
    } catch (error) {
        console.error("Error in authDeleteTemplate middleware", error);
        next(error);
    }
};

exports.authGetTemplate = (req, res, next) => {
    if (!TemplateAuthorization.belongsToCompany(req.params.companyId, req.user.company_id)) {
        return res.status(403).json({ message: 'Unauthorized Access!' });
    }
    next();
};