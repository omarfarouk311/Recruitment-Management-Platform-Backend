const { produce} = require("../../common/kafka")
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
  companyName = await getCompanyName(companyId); 
  const logData = {
    performed_by: companyName,
    company_id: companyId,
    created_at: new Date(),
    extra_data: JSON.stringify({ templateData, placeholders }),
    action_type: 'create_template',
};
await produce(logData, logs_topic);
  return res;
};

exports.updateTemplate = async (id, updatedData,companyId) => {
  const placeholders = extractPlaceholders(updatedData.description);
  const res = await Templates.updateTemplate(id, updatedData,placeholders);
  companyName = await getCompanyName(companyId); 
  const logData = {
    performed_by: companyName,
    company_id: companyId,
    created_at: new Date(),
    extra_data: JSON.stringify({ id, updatedData, placeholders }),
    action_type: 'update_template',
};
await produce(logData, logs_topic);
  return res; 
};

exports.deleteTemplate = async (id,companyId) => {
  const res = await Templates.deleteTemplate(id); 
  companyName = await getCompanyName(companyId); 
  const logData = {
    performed_by: companyId,
    company_id: companyId,
    created_at: new Date(),
    extra_data: JSON.stringify({ id }),
    action_type: 'remove_template',
};
await produce(logData, logs_topic);
  return res;
};