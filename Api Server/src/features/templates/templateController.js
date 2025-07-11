const Templates  = require('./templateService');

exports.getAllTemplates = async (req, res, next) => {
    try {
        const { sortBy , page, simplified } = req.query;
        const templates = await Templates.getAllTemplates(req.userId, sortBy, page, req.userRole, simplified);
        return res.status(200).json(templates);
    } catch (error) {
        next(error);
    }
};

exports.getTemplateDetails = async (req, res, next) => {
    try{
        const { id } = req.params;
        const template = await Templates.getTemplateById(id, req.query.simplified);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json(template);
    } catch (error) {
        next(error);
    }
};

exports.addTemplate = async (req, res, next) => {
    try {
        const newTemplate = req.body;
        const createdTemplate = await Templates.createTemplate(newTemplate,req.userId);
        res.status(201).json({ success: true, data: createdTemplate });
    } catch (error) {
        next(error);
    }
};

exports.editTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyId = req.userId;
        const updatedData = req.body;
        const updatedTemplate = await Templates.updateTemplate(id, updatedData,companyId);
        if (!updatedTemplate) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: updatedTemplate });
    } catch (error) {
        next(error);
    }
};

exports.deleteTemplate = async (req, res,next) => {
    try {
        const { id } = req.params;
        const companyId = req.userId;
        const deleted = await Templates.deleteTemplate(id,companyId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
        next(error);
    }
};


exports.getOfferDetails = async (req, res, next) => {
    try {
        const { jobId, seekerId } = req.params;
        const offerDetails = await Templates.getOfferDetails(jobId, seekerId);
        if (!offerDetails) {
            return res.sendStatus(404);
        }
        res.status(200).json(offerDetails);
    } catch (error) {
        next(error);
    }
}


exports.sendOfferDetails = async (req, res, next) => {
    try {
        const { jobId, seekerId } = req.params;
        const { placeholders, templateId } = req.body;
        const updatedOfferDetails = await Templates.sendOfferDetails(jobId, seekerId, placeholders, templateId);
        if (!updatedOfferDetails) {
            return res.sendStatus(404);
        }
        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
}