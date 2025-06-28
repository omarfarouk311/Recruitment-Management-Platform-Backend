const produce = require('../../common/kafka');
const Pool = require('../../../config/db');
const { logs_topic, action_types } = require('../../../config/config')
const { v6: uuid } = require('uuid');


class recruitment_process {

    static async getRecruitmentProcess(companyId, queryPagination) {
        try {
            let { page, limit } = queryPagination;
            let query = `SELECT id, name, num_of_phases FROM recruitment_process WHERE company_id = $1 ORDER BY id`;
            let values = [companyId]
            if (limit) {
                const offset = (page - 1) * limit;
                values.push(limit);
                values.push(offset);
                query += ' LIMIT $2 OFFSET $3'
            }    
            let pool = Pool.getReadPool();
            const { rows } = await pool.query(query, values);
            return rows;
        } catch (error) {
            console.log('Error in getRecruitmentProcess \n', error.message);
            throw error;
        }
    }

    static async getRecruitmentProcessDetails(recruitmentProcessId) {
        try {            
            const query = `
                WITH recruitmentId AS (
                    SELECT phase_num, name, type, deadline, assessment_id
                    FROM Recruitment_Phase
                    WHERE recruitment_process_id = $1
                ),
                typeId AS (
                    SELECT phase_num, p.name, r.type, r.deadline, r.assessment_id
                    FROM recruitmentId r
                    JOIN Phase_Type p
                    ON r.type = p.id
                )
                SELECT t.phase_num, t.name as phaseName, t.type, t.deadline, a.name as assessmentName, a.assessment_time
                FROM typeId t
                LEFT JOIN Assessment a
                ON assessment_id = id
                order by t.phase_num;
            `;
            let pool = Pool.getReadPool();
            const { rows } = await pool.query(query, [recruitmentProcessId]);
            return rows;
        } catch (error) {
            console.log('Error in recruitment_processModel \n', error.message);
            throw error;
        }
    }

    static async createRecruitmentProcess(companyId, processName, data) {
        let pool = Pool.getWritePool();
        pool = await pool.connect();
        await pool.query('BEGIN');
        try {
            const createProcessQuery = `
                INSERT INTO Recruitment_Process (name, num_of_phases, company_id)
                VALUES ($1, $2, $3)
                RETURNING id
            `;
            const values = [processName, data.length, companyId];
            const { rows } = await pool.query(createProcessQuery, values);

            const processId = rows[0].id;
            const validationPromises = data.map(async (item) => {
                const errors = await this.validateRecruitmentProcessData(item);
                if (errors.length > 0) {
                    return errors;
                }
                return null;
            });
            let allErrors = await Promise.all(validationPromises);
            allErrors = allErrors.filter(errors => errors !== null);
            if (allErrors.length > 0) {
                const error = new Error("Validation Error while creating recruitment process");
                error.status = 400;
                error.msg = allErrors;
                throw error;
            }
            for (let i = 0; i < data.length; i++) {
                const insertPhaseQuery = `
                    INSERT INTO Recruitment_Phase (recruitment_process_id, phase_num, name, type, deadline, assessment_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                const values = [
                    processId,
                    data[i].phaseNumber,
                    data[i].phaseName,
                    data[i].phaseType,
                    data[i].deadline || null,
                    data[i].assessmentId || null
                ];
                await pool.query(insertPhaseQuery, values);
            }
            const query = `SELECT name FROM company WHERE id = $1`;
            const result = await pool.query(query, [companyId]);
            const companyName = result.rows[0].name;
            const id = uuid();
            const processObject = {
                id,
                performed_by: companyName,
                company_id: companyId,
                created_at: new Date(),
                extra_data: null,
                action_type: action_types.create_recruitement_process
            }
            await produce.produce(processObject, logs_topic);
            try {
                await pool.query('COMMIT');
            } catch (err) {
                await produce({
                        id,
                        type: 0
                }, logs_topic);
                throw err;
            }
            return { id: processId };
        } catch (error) {
            await pool.query('ROLLBACK');
            console.log('Error in createRecruitmentProcess');
            throw error;
        } finally {
            pool.release();
        }
    }


    static async validateRecruitmentProcessData({ phaseName, phaseType, deadline, assessmentId }) {
        let getPhaseType = `select name FROM Phase_Type WHERE id = $1`;
        let pool = Pool.getReadPool(), errors = [];
        const { rows, rowCount } = await pool.query(getPhaseType, [phaseType]);
        if (rowCount == 0) {
            errors.push('Phase type not found, please provide a valid phase type');
        }
        if (rowCount > 0) {
            if (rows[0].name === 'assessment') {
                if (!deadline || !assessmentId) {
                    errors.push('Assessment phase must have a deadline and an assessment id');
                }
            }
            else {
                if (deadline || assessmentId) {
                    errors.push('Only assessment phase should have a deadline and an assessment id');
                }
            }
        }
        return errors;
    }

    static async updateRecruitmentProcess(companyId, processId, processName, data) {
        let pool = Pool.getWritePool();
        pool = await pool.connect()
        try {
            const validationPromises = data.map(async (item) => {
                const errors = await this.validateRecruitmentProcessData(item);
                if (errors.length > 0) {
                    return errors;
                }
                return null;
            });
            let allErrors = await Promise.all(validationPromises);
            allErrors = allErrors.filter(errors => errors !== null);
            if (allErrors.length > 0) {
                console.log("Validation Error while updating recruitment process");
                const error = new Error("Validation Error while updating recruitment process");
                error.status = 400;
                error.msg = allErrors.flat()
                throw error;
            }
            await pool.query('BEGIN');
            const deletePhasesQuery = `DELETE FROM recruitment_phase WHERE recruitment_process_id = $1`;
            await pool.query(deletePhasesQuery, [processId]);

            const updateProcess = `UPDATE recruitment_process SET num_of_phases = $1, name = $2 WHERE id = $3`;
            const values = [data.length, processName, processId];
            await pool.query(updateProcess, values);

            for (let i = 0; i < data.length; i++) {
                const insertPhaseQuery = `
                    INSERT INTO Recruitment_Phase (name, type, deadline, assessment_id, phase_num, recruitment_process_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                const values = [
                    data[i].phaseName,
                    data[i].phaseType,
                    data[i].deadline || null,
                    data[i].assessmentId || null,
                    data[i].phaseNumber,
                    processId,
                ];
                await pool.query(insertPhaseQuery, values);
            }

            const query = `SELECT name FROM company WHERE id = $1`;
            const result = await pool.query(query, [companyId]);
            const companyName = result.rows[0].name;
            const id = uuid();
            const processObject = {
                id: uuid(),
                performed_by: companyName,
                company_id: companyId,
                created_at: new Date(),
                extra_data: null,
                action_type: action_types.update_recruitment_process
            }
            await produce.produce(processObject, logs_topic);
            try {
                await pool.query('COMMIT');
            } catch (err) {
                await produce({
                    id,
                    type: 0
                }, logs_topic);
                throw err;
            }
            return { message: 'Recruitment process updated successfully' };

        } catch (error) {
            await pool.query('ROLLBACK');
            console.log('Error in updateRecruitmentProcess');
            throw error;
        } finally {
            pool.release();
        }

    }

    static async deleteRecruitmentProcess(companyId, processId) {
        try {
            const deleteQuery = `DELETE FROM recruitment_process WHERE id = $1`;
            const values = [processId];
            let pool = Pool.getWritePool();
            const query = `SELECT name FROM company WHERE id = $1`;
            const result = await pool.query(query, [companyId]);
            const companyName = result.rows[0].name;
            const id = uuid();
            const processObject = {
                id,
                performed_by: companyName,
                company_id: companyId,
                created_at: new Date(),
                extra_data: null,
                action_type: action_types.remove_recruitement_process
            }
            await produce.produce(processObject, logs_topic);
            try {
                await pool.query(deleteQuery, values);
            } catch (err) {
                await produce({
                    id,
                    type: 0
                }, logs_topic);
                
                throw err;
            }
            return { message: 'Recruitment process deleted successfully' };
        } catch (error) {
            console.log('Error in deleteRecruitmentProcess');
            throw error;
        }
    }

    // for authorization
    static getCompanyIdOfProcess = async (processId) => {
        try {
            const query = `SELECT company_id FROM recruitment_process WHERE id = $1`;
            const values = [processId];
            let pool = Pool.getReadPool();
            const { rows } = await pool.query(query, values);
            if (rows.length === 0) {
                const error = new Error('Recruitment process not in database');
                error.status = 404;
                error.msg = 'Recruitment process not found';
                throw error;
            }
            return rows[0].company_id;

        } catch (error) {
            console.log('Error in getProcessById');
            throw error;
        }
    }

    static async getPhases() {
        try {
            const query = `SELECT id, name FROM phase_type`;
            let pool = Pool.getReadPool();
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.log('Error in getPhases');
            throw error;
        }
    }
}

module.exports = recruitment_process;