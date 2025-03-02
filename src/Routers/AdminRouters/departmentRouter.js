const express = require ('express');
const { getAllDepartment, createDepartment, updateDepartment, deleteDepartment, getDepartmentByIdQuery } = require('../../Controllers/AdminController/departmentController');

const departmentRouter = express.Router();


departmentRouter.get('/allDepartment', getAllDepartment); // Get all departments
departmentRouter.post('/createDepartment/', createDepartment); // Create a new department
departmentRouter.put('/updateDepartment/:id', updateDepartment); // Update a department by ID
departmentRouter.delete('/:id', deleteDepartment); // Delete a department by ID
departmentRouter.get('/:id', getDepartmentByIdQuery);



module.exports = departmentRouter