const { Pool } = require('pg');
const config = require('./config');

const primaryPool = new Pool({
    host: config.master_db,
    user: config.db_user,
    password: config.db_user_password,
    port: config.db_port,
    database: config.db_name,
    statement_timeout: 5000,
    query_timeout: 5000,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 0,
    max: 20,
    min: 5,
});

exports.getWritePool = () => primaryPool;
