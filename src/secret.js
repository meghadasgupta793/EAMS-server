require('dotenv').config();

const serverPort = process.env.PORT || 3004;
const sqlServer = process.env.SQL_SERVER;  // Correct variable name
const sqlUsername = process.env.SQL_USERNAME;  // Correct variable name
const sqlPassword = process.env.SQL_PASSWORD;  // Correct variable name
const sqlDB = process.env.SQL_DB;  // Correct variable name



const smtpUserName ='niduram@gmail.com';
const smtpPassword ='pxvexuuakhxvvxmi';

const JWT_SECRET='MyLove'

module.exports = {
    serverPort: serverPort,
    sqlUsername: sqlUsername,
    sqlPassword: sqlPassword,
    sqlServer: sqlServer,
    sqlDB: sqlDB,
    smtpUserName,
    smtpPassword,
    JWT_SECRET
};
