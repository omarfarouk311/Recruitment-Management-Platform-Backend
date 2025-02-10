require('dotenv').config();

module.exports = {
    master_db: process.env.MASTER_NAME,
    db_user: process.env.DB_USER,
    db_user_password: process.env.DB_USER_PASSWORD,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    logs_topic: process.env.KAFKA_LOGS,
    brokers: [process.env.KAFKA_BROKER1, process.env.KAFKA_BROKER2]
};
