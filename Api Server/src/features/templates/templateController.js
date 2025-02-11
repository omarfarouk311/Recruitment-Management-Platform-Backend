const Templates  = require('./templateService');

exports.getAllTemplates = async (req, res, next) => {
    try {
        const { sortBy = 1, page, simplified } = req.query;
        (simplified)
        const templates = await Templates.getAllTemplates(req.userId, sortBy, page, req.userRole, simplified);
        return res.status(200).json({ success: true, data: templates });
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
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};

exports.addTemplate = async (req, res) => {
    try {
        const newTemplate = req.body;
        const createdTemplate = await Templates.createTemplate(newTemplate,req.userId);
        res.status(201).json({ success: true, data: createdTemplate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.editTemplate = async (req, res) => {
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
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.userId;
        const deleted = await Templates.deleteTemplate(id,companyId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};