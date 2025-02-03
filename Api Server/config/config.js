require('dotenv').config();

module.exports = {
    master_db: process.env.MASTER_NAME,
    replica1: process.env.STANDBY1_NAME,
    replica2: process.env.STANDBY2_NAME,
    db_user: process.env.DB_USER,
    db_user_password: process.env.DB_USER_PASSWORD,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    port: process.env.PORT || 3000,
    logs_topic: process.env.KAFKA_LOGS,
    cv_parsing_topic: process.env.KAFKA_CV_PARSING,
    job_parsing_topic: process.env.KAFKA_JOB_PARSING,
    cv_embedding: process.env.KAFKA_CV_EMBEDDING_GENERATION,
    job_embedding_topic: process.env.KAFKA_JOB_EMBEDDING_GENERATION,
    profile_embedding_topic: process.env.KAFKA_PROFILE_EMBEDDING_GENERATION
};
