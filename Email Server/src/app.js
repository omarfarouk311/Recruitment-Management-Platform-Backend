process.env.TZ = 'UTC';
const consumer = require('../config/kafka');
const { getReadPool } = require('../config/db');
const { emails_topic, email_types } = require('../config/config');
const mailjet = require('../config/mailjet');
const { getInterviewEmailTemplate, getJobAcceptanceEmail, getJobClosingTemplate, getJobOfferTemplate,
    getJobRejectionEmail, getPhasesEmailTemplate, getRecruiterInvitationTemplate } = require('./templates');

(async function () {
    const pool = getReadPool();
    await consumer.connect();
    await consumer.subscribe({ topic: emails_topic, fromBeginning: true });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            let { type, jobId, companyId, jobSeeker, templateId, deadline, interview, newPhaseName, rejected, recruiterId, department, phaseNum } = JSON.parse(message.value);
            let email, jobTitle, phaseType;

            try {
                if (deadline) {
                    deadline = new Date(deadline).toUTCString();
                }

                if (jobId) {
                    let query = `SELECT title ${phaseNum ? ', phase_type.name as "phaseType", recruitment_phase.name as "newPhaseName"' : ''} FROM job `;
                    let params = [jobId];

                    if (phaseNum) {
                        query += `
                            JOIN recruitment_phase ON job.recruitment_process_id = recruitment_phase.recruitment_process_id and recruitment_phase.phase_num = $2
                            JOIN phase_type ON recruitment_phase.type = phase_type.id
                        `;
                        params.push(phaseNum);
                    }
                    query += `WHERE job.id = $1`;
                    const res = await pool.query(query, params);

                    if (res.rows.length == 0) {
                        let error = new Error('job not found!');
                        error.cause = 'self';
                        throw error;
                    }
                    
                    jobTitle = res.rows[0].title;
                    if (res.rows[0].newPhaseName) {
                        newPhaseName = res.rows[0].newPhaseName;
                        phaseType = res.rows[0].phaseType;
                    }
                }

                if (companyId) {
                    var { name: companyName, email: companyEmail } = (await pool.query(`
                        SELECT name, email 
                        FROM company 
                        JOIN users ON company.id = users.id 
                        WHERE users.id = $1`, [companyId]
                    )).rows[0];
                }

                let recruiter;
                if (recruiterId) {
                    const { rows } = await pool.query(`
                        SELECT name, email
                        FROM recruiter
                        JOIN users ON recruiter.id = users.id
                        WHERE recruiter.id = $1
                        `, [recruiterId]);

                    recruiter = rows[0];
                }

                if (jobSeeker) {
                    let jobSeekerData = (await pool.query(`
                        SELECT name, users.email
                        FROM job_seeker
                        JOIN users ON job_seeker.id = users.id
                        WHERE job_seeker.id = $1
                    `, [jobSeeker])).rows[0];

                    if (type == email_types.change_phase) {
                        email = getPhasesEmailTemplate(
                            jobTitle,
                            companyName,
                            jobSeekerData.name,
                            jobSeekerData.email,
                            rejected,
                            deadline ? deadline : undefined,
                            phaseType === 'interview' || interview ? true : false,
                            newPhaseName
                        )
                    }
                    else if (type == email_types.interview_date) {
                        email = getInterviewEmailTemplate(
                            jobTitle,
                            companyName,
                            jobSeekerData.name,
                            jobSeekerData.email,
                            deadline
                        )
                    }
                    else if (type == email_types.job_offer) {
                        email = await getJobOfferTemplate(
                            jobTitle,
                            companyName,
                            jobSeekerData.name,
                            jobSeekerData.email,
                            templateId,
                            jobId,
                            jobSeeker
                        );
                    }
                    else if (type == email_types.job_offer_acceptance) {
                        if (rejected) {
                            email = getJobRejectionEmail(
                                companyName,
                                companyEmail,
                                jobSeekerData.name,
                                jobSeekerData.email,
                                jobTitle
                            );
                        }
                        else {
                            email = getJobAcceptanceEmail(
                                companyName,
                                companyEmail,
                                jobSeekerData.name,
                                jobSeekerData.email,
                                jobTitle
                            );
                        }
                    }
                }

                else if (type == email_types.company_invitation) {
                    email = getRecruiterInvitationTemplate(
                        recruiter.name,
                        recruiter.email,
                        companyName,
                        department,
                        deadline
                    );
                }

                else if (type == email_types.job_closing) {
                    email = getJobClosingTemplate(
                        jobTitle,
                        companyName,
                        companyEmail
                    );
                }

                const result = await mailjet
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [email]
                    });

                if (result.response.status == 200) {
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: (Number(message.offset) + 1).toString()
                    }]);
                }
            }
            catch (err) {
                console.error("Error in email server", err);
                if (err.statusCode === 400) {
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: (Number(message.offset) + 1).toString()
                    }]);
                }
            }
        }
    });
})();