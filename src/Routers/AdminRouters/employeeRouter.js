const express = require('express');
const { createEmployees, updateEmployee, getAllEmployee, getEmployeeByID, getEmployeeByEmpNoOrName, getEmployeeByEmpNo, getEmpInfoByID } = require('../../Controllers/AdminController/employeeController');
const multer = require('multer');
const { fileFilter, employeeImgStorage } = require('../../utils/fileHelper');
const authenticateToken = require('../../auth/authenticateToken ');

// Initialize multer upload middleware
const upload = multer({
  storage: employeeImgStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
  fileFilter: fileFilter
});

const employeeRouter = express.Router();



employeeRouter.get('/allEmployees', authenticateToken,getAllEmployee); // Get all EmployeeS
employeeRouter.get('/:id', authenticateToken,getEmployeeByID); // Get EmployeeS
employeeRouter.get('/getEmployeeByEmpNoOrName',authenticateToken, getEmployeeByEmpNoOrName); // Get EmployeeS
// Route to create a new employee
employeeRouter.post('/createEmployee', authenticateToken,upload.single('Photo'), async (req, res, next) => {
    try {
        // Extract file information if uploaded
        req.body.PictureName = req.file ? req.file.filename : null;

        // Call the createEmployees function
        await createEmployees(req, res, next);
    } catch (error) {
        console.error("Error processing employee request:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Route to Update a employee
employeeRouter.put('/updateEmployee/:id', authenticateToken,upload.single('Photo'), async (req, res, next) => {
    try {
        // Extract file information if uploaded
        req.body.PictureName = req.file ? req.file.filename : null;

        // Call the createEmployees function
        await updateEmployee(req, res, next);
    } catch (error) {
        console.error("Error processing employee request:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

employeeRouter.get('/getEmployeeByempNo/:empNo', authenticateToken,getEmployeeByEmpNo); // Get EmployeeS
employeeRouter.get('/getEmpInfoByID/:id', authenticateToken,getEmpInfoByID); // Get EmployeeS

module.exports = employeeRouter;
