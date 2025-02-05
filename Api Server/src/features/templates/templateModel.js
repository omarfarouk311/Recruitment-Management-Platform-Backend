const { getReadPool,getWritePool } = require('../../../config/db');


class TemplateAuthorization {
    static isCompanyUser(req) {
        return req.user && req.user.role === 'company';
    }

    static async hasPermission(templateId, userId) {
        const pool = getReadPool();
        const result = await pool.query('SELECT company_id FROM templates WHERE id = $1', [templateId]);
        const template = result.rows[0];
        return template && template.company_id === userId;
    }

    static belongsToCompany(companyId, userId) {
        return companyId === userId;
    }
}

class Templates {

    static async getAllTemplates(companyId, sortBy = 1, offset = 0, limit = process.env.PAGINATION_LIMIT || 5) {
        const pool = getReadPool();
        const order = sortBy === 1 ? 'ASC' : 'DESC';
        const result = await pool.query(
            `SELECT name, date_updated FROM templates WHERE company_id = $1 ORDER BY date_updated ${order} OFFSET $2 LIMIT $3`,
            [companyId, offset, limit]
        );
        return result.rows;
    }

    static async getTemplateById(id) {
        const pool = getReadPool();
        const result = await pool.query('SELECT name, description, company_id, placeholders FROM templates WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async createTemplate(templateData,companyId,placeholders) {
        const pool = getWritePool();
        const result = await pool.query(
            'INSERT INTO templates (name, description, company_id, placeholders, date_updated) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [templateData.name, templateData.description, companyId, placeholders]
        );
        return result.rows[0];
    }

    static async updateTemplate(id, updatedData,placeholders) {
        const pool = getWritePool();
        const result = await pool.query(
            'UPDATE templates SET name = $1, description = $2, placeholders = $3, date_updated = NOW() WHERE id = $4 RETURNING *',
            [updatedData.name, updatedData.description, placeholders, id]
        );
        return result.rows[0];
    }

    static async deleteTemplate(id) {
        const pool = getWritePool();
        const result = await pool.query('DELETE FROM templates WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = {
    Templates,
    TemplateAuthorization
};