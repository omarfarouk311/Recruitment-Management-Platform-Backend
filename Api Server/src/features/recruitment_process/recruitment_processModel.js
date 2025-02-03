const produce = require('../../common/kafka');

class recruitment_process {
    constructor({id, name, num_phases, company_id}) {
        this.id = id;
        this.name = name;
        this.num_phases = num_phases;
        this.company_id = company_id;
    }

    static async getRecruitmentProcess(companyId) {
        try {
            const query = `SELECT id, name, num_of_phases FROM Recruitment_Process WHERE company_id = $1`;
            const values = [companyId];
            let pool;
            try {
                pool = pool.getReadPool();
            } catch (error) {
                console.error('Error: getReadPool is not defined (getRecruitmentProcess) in recruitment_processModel');
                error.statusCode = 500;
                error.message = 'Cannot connect to database, ' + error.message;
                throw error;
            }
            const { rows } = await pool.query(query, values);
            return rows;
        } catch (error) {
            console.log('Error in: recruitment_processModel (getRecruitmentProcess)');
            error.statusCode = 500;
            error.message = 'Internal Database server error, ' + error.message;
        } 
    }

    static async getRecruitmentProcessById(recruitmentProcessId) {
        try {
            const query = `
                WITH recruitmentId AS (
                    SELECT phase_num, name, type, deadline, assessment_id
                    FROM Recruitment_Phase
                    WHERE recruitment_process_id = $1
                ),
                typeId AS (
                    SELECT phase_num, p.name, p.type, p.deadline, r.assessment_id
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
            pool = pool.getReadPool();
            const { rows } = await pool.query(query, [recruitmentProcessId]);
            return rows;
        } catch (error) {
            console.log('Error in: recruitment_processModel (getRecruitmentProcessById)');
            error.statusCode = 500;
            error.message = 'Internal Database server error, ' + error.message;
            throw error;
        } finally {
            pool.release();
        }
    }

    static async createRecruitmentProcess(companyId, processName, data) {
        pool = pool.getWritePool();
        pool = await pool.connect();
        pool = await pool.query('BEGIN');
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
                error.statusCode = 400;
                error.details = allErrors;
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
            await pool.query('COMMIT');
            const processObject = {
                "performed_by": "Company",
                "company_id": companyId,
                "extra_data": null,
                "action_type": "Create new process",
            }
            produce.produceLog(processObject);
            return { message: 'Recruitment process created successfully' };
        } catch (error) {
            await pool.query('ROLLBACK');
            console.log('Error in: recruitment_processModel (createRecruitmentProcess)');
            error.statusCode = 500;
            error.message = 'Internal Database server error';
            throw error;
        } finally {
            pool.release();
        }
    }

    
    static async validateRecruitmentProcessData({ phaseType, deadline, assessmentId } ) {
        let getPhaseType = `select name FROM Phase_Type WHERE id = $1`;
        let pool = pool.getReadPool();
        const { rows, rowCount } = await pool.query(getPhaseType, [phaseType]);
        if (rowCount == 0) {
            errors.push('Phase type not found, please provide a valid phase type');
        }
        if (rowCount > 0) {
            if (rows[0].name === 'Assessment') {
                if (!deadline || !assessmentId) {
                    errors.push('Assessment phase must have a deadline and an assessment id');
                }
            }
        }
        return errors;
    }

    static async updateRecruitmentProcess(companyId, processId, data) {
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
                const error = new Error("Validation Error while updating recruitment process");
                error.statusCode = 400;
                error.details = allErrors;
                throw error;
            }
            let pool = pool.getWritePool();
            pool = await pool.connect()
            pool = await pool.query('BEGIN');
            for (let i = 0; i < data.length; i++) {
                const updateQuery = `
                    UPDATE Recruitment_Phase 
                    SET name = $1, type = $2, deadline = $3, assessment_id = $4, phase_num = $5
                    WHERE recruitment_process_id = $6;
                `;
                const values = [
                    data[i].phaseName,
                    data[i].phaseType,
                    data[i].deadline || null,
                    data[i].assessmentId || null,
                    data[i].phaseNumber,
                    processId,
                ];
                await pool.query(updateQuery, values);
            }
            await pool.query('COMMIT');
            const processObject = {
                "performed_by": "Company",
                "company_id": companyId,
                "extra_data": null,
                "action_type": "Update new process",
            }
            produce.produceLog(processObject);
            return { message: 'Recruitment process updated successfully' };

        } catch (error) {
                await pool.query('ROLLBACK');
                console.log('Error in: recruitment_processModel (updateRecruitmentProcess)');
                error.statusCode = 500;
                error.message = 'Internal Database server error';
                throw error;
        } finally {
                pool.release();
        }
    
    }

    static async deleteRecruitmentProcess(companyId, processId) {
        try {
            const deleteQuery = `DELETE FROM Recruitment_Process WHERE id = $1`;
            const values = [processId];
            pool = pool.getWritePool();
            await pool.query(deleteQuery, values);
            const processObject = {
                "performed_by": "Company",
                "company_id": companyId,
                "extra_data": null,
                "action_type": "Delete new process",
            }
            return { message: 'Recruitment process deleted successfully' };
        } catch (error) {
            console.log('Error in: recruitment_processModel (deleteRecruitmentProcess)');
            error.statusCode = 500;
            error.message = 'Internal Database server error';
            throw error;
        } 
    }


    static getProcessById = async (processId) => {
        try {
            const query = `SELECT company_id FROM Recruitment_Process WHERE id = $1`;
            const values = [processId];
            pool = pool.getReadPool();
            const { rows } = await pool.query(query, values);
            if (rows.length === 0) {
                const error = new Error('Recruitment process not found');
                error.statusCode = 404;
                throw error;
            }
            return rows[0].company_id;

        } catch (error) {
            console.log('Error in: authorizeRecruitmentProcess', error);
            error.statusCode = error.statusCode || 500;
            error.message = error.message ||'Internal server error';
            throw error;
        }
    }
    
}

module.exports = recruitment_process;