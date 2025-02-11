const { Templates, HelperQuerySet } = require('./templateModel');
const { role } = require('../../../config/config');
const constants = require('../../../config/config')



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


exports.getAllTemplates = async (userId, sortBy, page, userRole, simplified) => {
  const limit = constants.pagination_limit
  const offset = (page - 1) * limit;
  
  let companyId = userRole === role.recruiter? (await HelperQuerySet.getCompanyId(userId)).company_id: userId;
  return await Templates.getAllTemplates(companyId, sortBy, offset, limit, simplified); 
};

exports.getTemplateById = async (id, simplified) => {
  return await Templates.getTemplateById(id, simplified); 
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

exports.getOfferDetails = async (jobId, seekerId) => {
  const offerDetails = await Templates.getOfferDetails(jobId, seekerId);
  return offerDetails;
};