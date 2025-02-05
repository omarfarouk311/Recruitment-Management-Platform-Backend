const { Templates } = require('./templateModel');


// Helper function to extract placeholders
function extractPlaceholders(value) {
    const placeholderPattern = /\{\{([^{}]+)\}\}/g; // Matches {{placeholder}}
    const placeholders = [];
    let match;

    while ((match = placeholderPattern.exec(value)) !== null) {
        placeholders.push(match[1].trim()); // Extract content inside {{ }} and trim
    }

    return placeholders;
}


exports.getAllTemplates = async (companyId, sortBy, offset, limit) => {
  return await Templates.getAllTemplates(companyId, sortBy, offset, limit); 
};

exports.getTemplateById = async (id) => {
  return await Templates.getTemplateById(id); 
};

exports.createTemplate = async (templateData,companyId) => {
  const placeholders = extractPlaceholders(templateData.description);
  return await Templates.createTemplate(templateData,companyId,placeholders); 
};

exports.updateTemplate = async (id, updatedData) => {
  const placeholders = extractPlaceholders(updatedData.description);
  return await Templates.updateTemplate(id, updatedData,placeholders); 
};

exports.deleteTemplate = async (id) => {
  return await Templates.deleteTemplate(id); 
};