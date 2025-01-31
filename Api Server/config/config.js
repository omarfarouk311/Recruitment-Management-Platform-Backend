require('dotenv').config();

module.exports = {
    master_db: process.env.MASTER_NAME,
    replica1: process.env.STANDBY1_NAME,
    replica2: process.env.STANDBY2_NAME,
    db_user: process.env.DB_USER,
    db_user_password: process.env.DB_USER_PASSWORD,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    port: process.env.PORT || 80,
};