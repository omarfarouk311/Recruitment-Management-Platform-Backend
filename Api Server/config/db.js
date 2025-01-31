const { Pool } = require('pg');
const config = require('./config');

exports.primaryPool = new Pool({
    host: config.master_db,
    user: 'postgres',
    password: 'postgres',
    port: config.db_port,
    database: config.db_name,
    statement_timeout: 5000,
    query_timeout: 5000,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 0,
    max: 20,
    min: 5,
});

exports.replica_1_Pool = new Pool({
    host: config.replica1,
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

exports.replica_2_Pool = new Pool({
    host: config.replica2,
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