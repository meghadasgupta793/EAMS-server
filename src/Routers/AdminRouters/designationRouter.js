const express = require ('express');
const { getAlldesignation, createdesignation, updatedesignation, deletedesignation, getDesignationByIdQuery } = require('../../Controllers/AdminController/designationController');

const designationRouter = express.Router();


designationRouter.get('/allDesignation', getAlldesignation); // Get all designations
designationRouter.get('/:id', getDesignationByIdQuery); // Get all designations
designationRouter.post('/createDesignation', createdesignation); // Create a new designation
designationRouter.put('/updateDesignation/:id', updatedesignation); // Update a designation by ID
designationRouter.delete('/:id', deletedesignation); // Delete a designation by ID



module.exports = designationRouter