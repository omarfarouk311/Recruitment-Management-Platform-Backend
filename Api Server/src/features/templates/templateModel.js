const { getReadPool,getWritePool } = require('../../../config/db');


class TemplateAuthorization {
   
    static async hasPermission(templateId, userId) {
        const pool = getReadPool();
        const result = await pool.query('SELECT company_id FROM job_offer_template WHERE id = $1', [templateId]);
        const template = result.rows[0];
        return template && template.company_id === userId;
    }

    static async belongsToCompany(templateId, recruiterId) {
        const pool = getReadPool();
        const result = await pool.query(
            `SELECT t.company_id 
             FROM job_offer_template t
             JOIN recruiter r ON t.company_id = r.company_id
             WHERE t.id = $1 AND r.user_id = $2`,
            [templateId, recruiterId]
        );
        const template = result.rows[0];
        return !!template; // Returns true if a matching record is found, false otherwise
    }
}

async function getCompanyName(userId){
    const pool = getReadPool();
    const result = await pool.query('SELECT name FROM Company WHERE user_id = $1', [userId]);
    return result.rows[0].company_name;
} 

class Templates {

    static async getAllTemplates(companyId, sortBy = 1, offset = 0, limit = process.env.PAGINATION_LIMIT || 5) {
        const pool = getReadPool();
        const order = sortBy === 1 ? 'ASC' : 'DESC';
        const result = await pool.query(
            `SELECT name, updated_at FROM job_offer_template WHERE company_id = $1 ORDER BY updated_at ${order} OFFSET $2 LIMIT $3`,
            [companyId, offset, limit]
        );
        return result.rows;
    }

    static async getTemplateById(id) {
        const pool = getReadPool();
        const result = await pool.query('SELECT name, description, company_id, placeholders FROM job_offer_template WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async createTemplate(templateData,companyId,placeholders) {
        const pool = getWritePool();
        const result = await pool.query(
            'INSERT INTO job_offer_template (name, description, company_id, placeholders, updated_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [templateData.name, templateData.description, companyId, placeholders]
        );
        return result.rows[0];
    }

    static async updateTemplate(id, updatedData,placeholders) {
        const pool = getWritePool();
        const result = await pool.query(
            'UPDATE job_offer_template SET name = $1, description = $2, placeholders = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [updatedData.name, updatedData.description, placeholders, id]
        );
        return result.rows[0];
    }

    static async deleteTemplate(id) {
        const pool = getWritePool();
        const result = await pool.query('DELETE FROM job_offer_template WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = {
    Templates,
    TemplateAuthorization
};