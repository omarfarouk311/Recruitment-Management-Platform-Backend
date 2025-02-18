process.env.TZ = 'UTC';
const consumer = require('../config/kafka');
const { getReadPool } = require('../config/db');
const { emails_topic, senderEmail, senderName, email_types } = require('../config/config');
const mailjet = require('../config/mailjet');

(async function () {
    const pool = getReadPool();
    await consumer.connect();
    await consumer.subscribe({ topic: emails_topic, fromBeginning: true });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            let { type, jobId, companyId, jobSeeker, templateId, deadline, interview, newPhaseName, rejected, recruiterId, department } = JSON.parse(message.value);
            try {
                if (deadline) {
                    deadline = new Date(deadline).toUTCString();
                }

                let email
                let pool = getReadPool();
                let jobTitle;
                if(jobId) {
                    jobTitle = await pool.query(`SELECT title FROM job WHERE id = $1`, [jobId]);
                    if (jobTitle.rows.length == 0) {
                        let error = new Error('job not found!');
                        error.cause = 'self';
                        throw error;
                    }
                    jobTitle = jobTitle.rows[0].title;
                }

                
                if(companyId) {
                    var { name: companyName, email: companyEmail } = (await pool.query(`
                        SELECT name, email 
                        FROM company 
                        JOIN users ON company.id = users.id 
                        WHERE users.id = $1`, [companyId]
                    )).rows[0];
                }

                let recruiter;
                if(recruiterId) {
                    let recruiter = await pool.query(`
                        SELECT
                            name,
                            email
                        FROM recruiter
                        JOIN users ON recruiter.id = users.id
                        WHERE recruiter.id = $1
                        `, [recruiterId]);

                    recruiter = recruiter.rows[0]
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
                            deadline? deadline: undefined, 
                            interview? interview: undefined, 
                            newPhaseName
                        )
                    } else if( type == email_types.interview_date ) {
                        email = getInterviewEmailTemplate(
                            jobTitle,
                            companyName,
                            jobSeekerData.name, 
                            jobSeekerData.email, 
                            deadline
                        )
                    } else if( type == email_types.job_offer ) {
                        email = await getJobOfferTemplate(
                            jobTitle, 
                            companyName,
                            jobSeekerData.name, 
                            jobSeekerData.email, 
                            templateId,
                            jobId,
                            jobSeeker
                        );
                    } else if( type == email_types.job_offer_acceptance ) {
                        if(rejected) {
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

                const result = await mailjet
                .post('send', {version: 'v3.1'})
                .request({
                    Messages: [email]
                });
                

                if(result.response.status == 200 || result.response.status == 400) {
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: (Number(message.offset) + 1).toString()
                    }]);
                }
            }
            catch (err) {
                console.error("Error in email server", err);
            }
        }
    });
})();


const getPhasesEmailTemplate = (jobTitle, companyName, jobSeekerName, jobSeekerEmail, rejected, deadline = null, interview = false, newPhaseName = '') => {
    const subject = `Application Update: ${jobTitle} at ${companyName}`;

    const textPart = rejected
        ? `Dear ${jobSeekerName},

        Thank you for your interest in the ${jobTitle} position at ${companyName}. We appreciate the time and effort you put into the process.

        After careful consideration, we regret to inform you that ${companyName} has decided to move forward with other candidates for this role. However, we encourage you to apply for future opportunities at ${companyName}.

        We sincerely appreciate your interest and wish you all the best in your job search.

        Best regards,
        ${senderName} Team`

        : `Dear ${jobSeekerName},

        We are excited to inform you that you have successfully progressed to the next phase of the recruitment process for the ${jobTitle} position at ${companyName}.

        The next phase is: ${newPhaseName}.

        ${deadline ? `The deadline will be on ${deadline}` : ''}

        ${interview ? 'We will be in touch with further details regarding this phase. Please let us know if you have any questions' : ''}.

        Looking forward to the next steps!

        Best regards,
        ${senderName} Team`;

    const htmlPart = rejected
                ? `<p>Dear ${jobSeekerName},</p>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We appreciate the time and effort you put into the process.</p>
        <p>After careful consideration, we regret to inform you that <strong>${companyName}</strong> has decided to move forward with other candidates for this role. However, we encourage you to apply for future opportunities at <strong>${companyName}</strong>.</p>
        <p>We sincerely appreciate your interest and wish you all the best in your job search.</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`

                : `<p>Dear ${jobSeekerName},</p>
        <p>We are excited to inform you that you have successfully progressed to the next phase of the recruitment process for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>The next phase is: <strong>${newPhaseName}</strong>.</p>
        ${deadline ? `<p>The deadline will be on <strong>${deadline}</strong>.</p>` : ''}
        ${interview ? `<p>We will be in touch with further details regarding this phase. Please let us know if you have any questions.</p>` : ''}
        <p>Looking forward to the next steps!</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`;


    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: jobSeekerEmail,
                Name: jobSeekerName
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};

const getInterviewEmailTemplate = (jobTitle, companyName, jobSeekerName, jobSeekerEmail, recruiterEmail, deadline) => {

    const subject = `Interview Invitation for ${jobTitle} Position at ${companyName}`;

    const textPart = `Dear ${jobSeekerName},

        We are pleased to invite you to an interview for the ${jobTitle} position at ${companyName}.

        The interview is scheduled for: ${deadline}.

        During this interview, we will discuss your qualifications and the role in more detail. If you have any conflicts with the scheduled date, please reach out to our recruiter at ${recruiterEmail}.

        Looking forward to speaking with you.

        Best regards,  
        ${senderName} Team`;

    const htmlPart = `<p>Dear ${jobSeekerName},</p>
        <p>We are pleased to invite you to an interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p><strong>Interview Date:</strong> ${deadline}</p>
        <p>During this interview, we will discuss your qualifications and the role in more detail. If you have any conflicts with the scheduled date, please reach out to our recruiter at <a href="mailto:${recruiterEmail}">${recruiterEmail}</a>.</p>
        <p>Looking forward to speaking with you.</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`;

    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: jobSeekerEmail,
                Name: jobSeekerName
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};

const getJobOfferTemplate = async (jobTitle, companyName, jobSeekerName, jobSeekerEmail, templateId, jobId, seekerId) => {
    const subject = `Job Offer for ${jobTitle} Position at ${companyName}`;

    const textPart = await getTemplateWithoutPlaceHolders(templateId, seekerId, jobId);

    const htmlPart = `<p>${textPart}</p>`;

    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: jobSeekerEmail,
                Name: jobSeekerName
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};

const getTemplateWithoutPlaceHolders = async (templateId, jobSeekerId, jobId) => {
    const client = getReadPool();
    
    let template = await client.query(`
        SELECT 
            description,
            candidates.placeholders_params AS placeholders_params
        FROM job_offer_template 
        JOIN (
            SELECT
                placeholders_params, template_id
            FROM candidates
            WHERE seeker_id = $2 AND job_id = $3
        ) AS candidates ON job_offer_template.id = candidates.template_id
        WHERE id = $1`, [templateId, jobSeekerId, jobId]);
    if (template.rows.length)
        template = template.rows[0];
    else {
        let error = new Error('template not found');
        error.cause = 'self';
        throw error;
    }

    
    template.description = template.description.replace(/{{(.+?)}}/g, (match, p1) => {
        return template.placeholders_params[p1] || match;
    });
    return template.description;
}

const getRecruiterInvitationTemplate = (recruiterName, recruiterEmail, companyName, department, deadline) => {
    const subject = `Invitation to Join ${companyName} as a Recruiter`;

    const textPart = `Dear ${recruiterName},

        We are pleased to invite you to join ${companyName} as a recruiter for the ${department} department.

        Please confirm your acceptance by ${deadline}.

        Looking forward to your response.

        Best regards,  
        ${senderName} Team`;

    const htmlPart = `<p>Dear ${recruiterName},</p>
        <p>We are pleased to invite you to join <strong>${companyName}</strong> as a recruiter for the <strong>${department}</strong> department.</p>
        <p>Please confirm your acceptance by <strong>${deadline}</strong>.</p>
        <p>Looking forward to your response.</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`;

    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: recruiterEmail,
                Name: recruiterName
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};


const getJobAcceptanceEmail = (companyName, companyEmail, jobSeekerName, jobSeekerEmail, jobTitle) => {
    const subject = `${jobSeekerName} has accepted the ${jobTitle} position at ${companyName}`;

    const textPart = `Dear Hiring Team at ${companyName},

        We are pleased to inform you that ${jobSeekerName} has officially accepted the job offer for the ${jobTitle} position at your company.

        You can now proceed with the necessary onboarding steps to ensure a smooth transition for ${jobSeekerName}.

        You may contact ${jobSeekerName} directly at ${jobSeekerEmail} for further communication.

        Best regards,  
        ${senderName} Team`;

            const htmlPart = `<p>Dear Hiring Team at <strong>${companyName}</strong>,</p>
        <p>We are pleased to inform you that <strong>${jobSeekerName}</strong> has officially accepted the job offer for the <strong>${jobTitle}</strong> position at your company.</p>
        <p>You can now proceed with the necessary onboarding steps to ensure a smooth transition for <strong>${jobSeekerName}</strong>.</p>
        <p>You may contact <strong>${jobSeekerName}</strong> directly at <a href="mailto:${jobSeekerEmail}">${jobSeekerEmail}</a> for further communication.</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`;

    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: companyEmail,
                Name: `Hiring Team at ${companyName}`
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};

const getJobRejectionEmail = (companyName, companyEmail, jobSeekerName, jobSeekerEmail, jobTitle) => {
    const subject = `${jobSeekerName} has declined the ${jobTitle} position at ${companyName}`;

    const textPart = `Dear Hiring Team at ${companyName},

        We regret to inform you that ${jobSeekerName} has declined the job offer for the ${jobTitle} position at your company.

        We appreciate your understanding and encourage you to consider ${jobSeekerName} for future opportunities.

        You may contact ${jobSeekerName} directly at ${jobSeekerEmail} for further communication.

        Best regards,  
        ${senderName} Team`;

    const htmlPart = `<p>Dear Hiring Team at <strong>${companyName}</strong>,</p>
        <p>We regret to inform you that <strong>${jobSeekerName}</strong> has declined the job offer for the <strong>${jobTitle}</strong> position at your company.</p>
        <p>We appreciate your understanding and encourage you to consider <strong>${jobSeekerName}</strong> for future opportunities.</p>
        <p>You may contact <strong>${jobSeekerName}</strong> directly at <a href="mailto:${jobSeekerEmail}">${jobSeekerEmail}</a> for further communication.</p>
        <p>Best regards,<br><strong>${senderName} Team</strong></p>`;

    return {
        From: {
            Email: senderEmail,
            Name: `${senderName} Team`
        },
        To: [
            {
                Email: companyEmail,
                Name: `Hiring Team at ${companyName}`
            }
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart
    };
};