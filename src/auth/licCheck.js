const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');

const SECRET_KEY = 'your-secret-key'; // Must match with the one used during encryption
const SALT = 'some-salt'; // Must match as well
const IV = Buffer.alloc(16, 0); // Fixed IV - must be the same during encryption/decryption

const LICENSE_FILE_PATH = path.join(__dirname, '../license.lic');
const router = express.Router();

async function readLicenseFile() {
    try {
        return await fs.promises.readFile(LICENSE_FILE_PATH, 'utf8');
    } catch (err) {
        throw new Error('Failed to read license file');
    }
}

function decryptLicense(encryptedLicense, secretKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(secretKey, SALT, 32);

    const decipher = crypto.createDecipheriv(algorithm, key, IV);
    let decrypted = decipher.update(encryptedLicense, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

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

async function checkLicense(req, res, next) {
    try {
        const encryptedLicense = await readLicenseFile();
        const license = decryptLicense(encryptedLicense, SECRET_KEY);
        const serverName = os.hostname();

        console.log('ServerName:', serverName);
        validateLicense(license, serverName);

        req.licenseInfo = {
            ServerName: license.ServerName,
            Validtill: license.Validtill,
            Module: license.Module
        };

        next();
    } catch (error) {
        console.error('License validation error:', error.message);
        res.status(403).json({ message: error.message });
    }
}

module.exports = { checkLicense, router };
