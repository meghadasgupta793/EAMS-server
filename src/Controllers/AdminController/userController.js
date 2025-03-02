const jwt = require('jsonwebtoken'); // Import jwt
const { poolPromise, sql } = require("../../config/db");
//const authenticateToken = require('../../auth/authenticateToken ');
const { JWT_SECRET } = require('../../secret');

const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(400).json({ message: 'Missing or invalid Authorization header' });
        }

        // Decode Base64 credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [UserName, Password] = credentials.split(':');
        console.log('Username:', UserName); // Log the username
        console.log('Password:', Password); // Log the password

        if (!UserName || !Password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserName', sql.VarChar, UserName)
            .query(`
                SELECT U.ID, UR.UserRole, UserName, Password, EmployeeID, 
                       E.EmpNo, E.EmployeeName, E.PictureName as Picture
                FROM [EAMS].[dbo].[tblMUser] U
                INNER JOIN tblMUserRole UR ON UR.UserRole_Id = U.UserRole
                INNER JOIN tblMEmployee E ON U.EmployeeID = E.id
                WHERE UserName = @UserName
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0];

        // Directly compare passwords (not recommended)
        if (Password !== user.Password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.ID }, JWT_SECRET, { expiresIn: '100m' });

        // Retrieve license information from `checkLicense` middleware
        const { ServerName, Validtill, Module } = req.licenseInfo || {};

        // Set the JWT token as a cookie with HttpOnly and Secure flags
        res.cookie('token', token, {
            httpOnly: true,  // Can't be accessed via JavaScript
            secure: process.env.NODE_ENV === 'production',  // Only set cookie over HTTPS in production
            expires: new Date(Date.now() + 120 * 60 * 1000),  // Set expiration to match the JWT token's expiration
            sameSite: 'Strict'  // Prevents sending the cookie along with cross-site requests
        });

        res.status(200).json({
            id: user.ID,
            UserRole: user.UserRole,
            UserName: user.UserName,
            EmployeeName: user.EmployeeName,
            EmpNo: user.EmpNo,
            EmployeeId: user.EmployeeID,
            Picture: user.Picture,
            license: { ServerName, Validtill, Module }  // Include license info in response
        });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

const logout = (req, res) => {
    try {
        // Clear the authentication cookie
        res.clearCookie('token', {
            httpOnly: true,  // Can't be accessed via JavaScript
            secure: process.env.NODE_ENV === 'production',  // Only clear cookie over HTTPS in production
            sameSite: 'Strict'  // Prevents sending the cookie along with cross-site requests
        });

        // Send a response indicating successful logout
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out', error: err.message });
    }
};










const getAllUser = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT  U.ID,UR.UserRole,UserName,Password,EmployeeID,E.EmpNo,E.EmployeeName,E.PictureName
  FROM [EAMS].[dbo].[tblMUser]  U
  inner join tblMUserRole UR on UR.UserRole_Id=U.UserRole
  inner join tblMEmployee E on U.EmployeeID=E.id`);

        if (result.recordset.length > 0) {
            res.status(200).send({
                message: "Users are retrieved successfully",
                data: result.recordset
            });
        } else {
            res.status(404).send({
                message: "No Users found"
            });
        }
    } catch (error) {
        console.error("Error retrieving Users:", error);
        res.status(500).send({
            message: "An error occurred while retrieving Users",
            error: error.message
        });
        next(error); // Optional, if you have global error handling middleware
    }
}

///create User
const createUser = async (req, res, next) => {
    try {
        const { UserName, Password ,UserRole, EmployeeId} = req.body;

        // Validate input
        if (!UserName || !Password || !UserRole || !EmployeeId) {
            return res.status(400).send({
                message: "UserName,Password,UserRole and EmployeeId are required"
            });
        }

        const pool = await poolPromise;

        // Check if the Code already exists
        const checkCode = await pool.request()
            .input('UserName', UserName)

            .query('SELECT * FROM tblMUser WHERE UserName = @UserName');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: ` '${UserName}' this username  is allready Exist`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()
            .input('UserName', sql.VarChar(20), UserName)
            .input('Password', sql.VarChar(10), Password)
            .input('UserRole', sql.Int, UserRole)
            .input('EmployeeId', sql.Int, EmployeeId)
            .query(`
                INSERT INTO tblMUser (UserName, Password,UserRole,EmployeeId)
                VALUES (@UserName, @Password,UserRole,EmployeeId);
            `);

        res.status(201).send({
            message: "User is created successfully",
            data: {
                UserName,
                EmployeeId
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the user",
            error: error.message
        });
        next(error);
    }
};




module.exports = {
    getAllUser,
    login,
    logout,
    createUser
    
      
};