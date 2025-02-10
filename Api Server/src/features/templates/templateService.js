const { Templates } = require('./templateModel');



// Helper function to extract placeholders
function extractPlaceholders (value) {
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

exports.getTemplateById = async (id,companyId) => {
  return await Templates.getTemplateById(id,companyId); 
};

exports.createTemplate = async (templateData,companyId) => {
  
  const placeholders = extractPlaceholders(templateData.description);
  const res = await Templates.createTemplate(templateData,companyId,placeholders);
  return res;

};

exports.updateTemplate = async (id, updatedData,companyId) => {

  const placeholders = extractPlaceholders(updatedData.description);
  const res = await Templates.updateTemplate(id, updatedData,placeholders,companyId);
  return res;

};
 
  

exports.deleteTemplate = async (id,companyId) => {

  const res = await Templates.deleteTemplate(id,companyId); 
  return res;

};