require('dotenv').config();

module.exports = {
    emails_topic: process.env.KAFKA_EMAILS,
    brokers: [process.env.KAFKA_BROKER1, process.env.KAFKA_BROKER2],
    replica1: process.env.STANDBY1_NAME,
    replica2: process.env.STANDBY2_NAME,
    db_user: process.env.DB_USER,
    db_user_password: process.env.DB_USER_PASSWORD,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    senderEmail: process.env.SENDER_EMAIL,
    mailjet_public_key: process.env.MAILJET_PUBLIC_API_KEY,
    mailjet_private_key: process.env.MAILJET_PRIVATE_API_KEY,
    email_types: {
        change_phase: 1,
        interview_date: 2,
        job_offer: 3,
        company_invitation: 4,
        job_offer_acceptance: 5,
        job_closing: 6,
    },
    senderName: 'Wuzzfni'
};
