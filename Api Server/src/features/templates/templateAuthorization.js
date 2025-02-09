const { TemplateAuthorization } = require('./templateModel');
const { role } = require("../../../config/config");

exports.authCreateTemplate = (req, res, next) => {
    if (req.userRole !== 'company') {
        return res.status(403).json({ message: 'Unauthorized Access!' });
    }
    next();
};

exports.authUpdateTemplate = async (req, res, next) => {
    try {
        const hasPerm = await TemplateAuthorization.hasPermission(req.params.id, req.userId);
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
        const hasPerm = await TemplateAuthorization.hasPermission(req.params.id, req.userId);
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

    if(req.userRole == role.company) { 
        if (!TemplateAuthorization.hasPermission(req.params.id,req.userId)){
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }
    }
        
    else if(req.userRole == role.recruiter) {
        if (!TemplateAuthorization.belongsToCompany(req.params.id,req.userId)){
            return res.status(403).json({ message: 'Unauthorized Access!' });
        }
    }

    else{ return res.status(403).json({ message: 'Unauthorized Access!' }); }
    next();
};

exports.authGetAllTemplates = (req, res, next) => {
    if (req.userRole !== 'company') {
        return res.status(403).json({ message: 'Unauthorized Access!' });
    }
    next();
}