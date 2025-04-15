const { getReadPool,getWritePool } = require('../../../config/db');
const { produce} = require("../../common/kafka")
const {getCompanyName} = require ('../candidates/candidateModel');
const { v4: uuid } = require('uuid');
const { action_types, logs_topic } = require("../../../config/config");


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
             WHERE t.id = $1 AND r.id = $2`,
            [templateId, recruiterId]
        );
        const template = result.rows[0];
        return !!template; // Returns true if a matching record is found, false otherwise
    }
}


class Templates {

    static async getAllTemplates(companyId, sortBy = 1, offset, limit, simplified) {
        const pool = getReadPool();
        const order = sortBy === 1 ? 'ASC' : 'DESC';
        const limitQuery = offset != undefined ? 'OFFSET $2 LIMIT $3' : '';
        let params = offset ? [companyId, offset, limit] : [companyId];
        const columns = simplified ? 'id, name' : 'id, name, updated_at';
        
        let query = `
            SELECT ${columns} 
            FROM job_offer_template 
            WHERE company_id = $1 
        `;
        
        if(!simplified)
            query += `ORDER BY updated_at ${order} ${limitQuery}`;
        
        
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async getTemplateById(id, simplified) {
        const pool = getReadPool();
        const result = await pool.query(`SELECT name, description ${simplified? '': ', placeholders'} FROM job_offer_template WHERE id = $1`, [id]);
        return result.rows.length? result.rows[0]: null;
    }

    static async createTemplate(templateData,companyId,placeholders) {
         const pool = await getWritePool().connect();
         const companyName = await getCompanyName(companyId); 
        
        try{
            
            await pool.query('BEGIN');
            const result = await pool.query(
                'INSERT INTO job_offer_template (name, description, company_id, placeholders, updated_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
                [templateData.name, templateData.description, companyId, placeholders]
            );

            
              await produce({
                id: uuid(),
                performed_by: companyName,
                created_at: new Date(),
                company_id: companyId,
                extra_data: { 
                  templateDataName: templateData.name
                },
                action_type:action_types.create_template
              },logs_topic);

            return result.rows[0];
        }
        catch(err){
            await pool.query('ROLLBACK');
            throw err;
        }
        finally{
            pool.release(); 
        }


    }

    static async updateTemplate(id, updatedData,placeholders,companyId) {

        const pool = await getWritePool();
        const companyName = await getCompanyName(companyId); 

        try{
            await pool.query('BEGIN');
            const result = await pool.query(
                'UPDATE job_offer_template SET name = $1, description = $2, placeholders = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
                [updatedData.name, updatedData.description, placeholders, id]
            );

            
              await produce({
                id: uuid(),
                performed_by: companyName,
                created_at: new Date(),
                company_id: companyId,
                extra_data: {
                  updatedName: updatedData.name
                },
                action_type:action_types.update_template
              },logs_topic);

            return result.rows[0];
        }
        catch(err){
            await pool.query('ROLLBACK');
            throw err;
        }
        finally{
            pool.release();
        }
    }

    static async deleteTemplate(id,companyId) {

        const pool = await getWritePool();
        const companyName = await getCompanyName(companyId);

        try{
            await pool.query('BEGIN');
            const result = await pool.query('DELETE FROM job_offer_template WHERE id = $1 RETURNING name' , [id] );

            if(result.length === 0) {
                return false;
            }
            const templateDelete = result[0].name;

            const logData = {
                performed_by: companyName,
                company_id: companyId,
                created_at: new Date(),
                extra_data: { deletedTemplate: templateDelete },
                action_type: action_types.remove_template,
              };
            
            await produce(logData, logs_topic);
            return result;
              

        }
        catch(err){
            await pool.query('ROLLBACK');
            throw err;
        }
        finally{
            pool.release();
        }      
    }
    
    static async getOfferDetails(jobId, seekerId) {
        const pool = getReadPool();
        let query = `
            SELECT 
                c.placeholders_params AS placeholders_params, 
                j.name AS template_name,
                j.description AS template_description,
                j.id AS template_id
            FROM candidates c
            JOIN job_offer_template j ON c.template_id = j.id
            WHERE c.job_id = $1 AND c.seeker_id = $2
        `

        const result = await pool.query(query, [jobId, seekerId]);
        return result.rows.length? result.rows[0]: null;
    }

    static async sendOfferDetails(jobId, seekerId, placeholders, templateId) {
        const client = await getWritePool().connect();
        await client.query('BEGIN');
        try {

            let candidate = await client.query(`
                SELECT 1 
                FROM candidates c
                JOIN recruitment_phase rp ON c.phase = rp.phase_num AND c.recruitment_process_id = rp.recruitment_process_id
                JOIN phase_type pt ON rp.type = pt.id
                WHERE job_id = $1 AND seeker_id = $2 AND pt.name = 'job offer'
                FOR UPDATE
            `, [jobId, seekerId])

            if (!candidate.rowCount) {
                let error = new Error('Candidate not found or template not set');
                error.msg = 'Candidate not found or template not set';
                error.status = 404;
                throw error;
            }


            const result = await client.query(
                'UPDATE candidates SET placeholders_params = $1, template_id = $2 WHERE job_id = $3 AND seeker_id = $4',
                [placeholders, templateId, jobId, seekerId]
            );

            
            return client;
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            throw error;
        }
    }
}

class HelperQuerySet {
    static async getCompanyIdByRecruiter(recruiterId) {
        const pool = getReadPool();
        const result = await pool.query('SELECT company_id FROM recruiter WHERE id = $1', [recruiterId]);
        return result.rows.length? result.rows[0].company_id: null;
    }

    static async getCompanyIdByJob(jobId) {
        const pool = getReadPool();
        const result = await pool.query('SELECT company_id FROM job WHERE id = $1', [jobId]);
        return result.rows.length? result.rows[0].company_id: null;
    }

    static async getJobOfferPlaceholders(templateId) {
        const pool = getReadPool();
        let jobOfferParams = await pool.query(
            'SELECT placeholders FROM job_offer_template WHERE id = $1',
            [templateId]
        );

        if (!jobOfferParams.rowCount) {
            let error = new Error('Template not found');
            error.msg = 'Template not found';
            error.status = 404;
            throw error;
        }

        jobOfferParams = jobOfferParams.rows[0].placeholders;
        return jobOfferParams;
    }
}

module.exports = {
    Templates,
    TemplateAuthorization,
    HelperQuerySet
};