const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SECRET_KEY = 'your-secret-key'; // Replace with your secret key
const LICENSE_FILE_PATH = path.join(__dirname, '../license.lic');

const router = express.Router();

// Function to read the license file
async function readLicenseFile() {
    try {
        const data = await fs.promises.readFile(LICENSE_FILE_PATH, 'utf8');
        return data;
    } catch (err) {
        throw new Error('Failed to read license file');
    }
}

// Function to decrypt the license information
function decryptLicense(encryptedLicense, secretKey) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedLicense, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

// Function to validate the license
function validateLicense(license, serverName) {
    const currentDate = new Date();
    const validUntil = new Date(license.Validtill);

    if (currentDate > validUntil) {
        throw new Error('License is expired');
    }

    if (license.ServerName !== serverName) {
        throw new Error('License is not valid for this server');
    }
}

// Middleware to check the license
async function checkLicense(req, res, next) {
    try {
        const encryptedLicense = await readLicenseFile();
        const license = decryptLicense(encryptedLicense, SECRET_KEY);
        const serverName = os.hostname(); // Get the server name from the OS

        console.log('ServerName:', serverName);
        validateLicense(license, serverName);

        req.licenseInfo = license; // Attach full license information to request

            // Attach the license info to the request object
    req.licenseInfo = {
        ServerName: license.ServerName,
        Validtill: license.Validtill,
        Module: license.Module
      };
  
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
}



module.exports = { checkLicense, router };
