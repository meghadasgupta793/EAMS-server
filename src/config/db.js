const sql = require('mssql'); // Import the mssql package
const { sqlUsername, sqlPassword, sqlServer, sqlDB } = require('../secret'); // Correct the path

const config = {
    user: sqlUsername, // Ensure this comes from .env
    password: sqlPassword, // Ensure this comes from .env
    server: sqlServer,
    database: sqlDB,
    options: {
        enableArithAbort: true, // Important for older SQL Server versions
        trustServerCertificate: true, // If you're using a self-signed cert
        instanceName: 'SQLEXPRESS', // Only add this if you're using a named instance
    },
    connectionTimeout: 150000,
    requestTimeout: 30000,  // ✅ Prevents query timeouts
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    port: 1433 // Make sure this matches the port for your SQL Server
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
