const express = require('express');
const { 
    
    createCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoryById, 
    getAllCategories
} = require('../../Controllers/AdminController/categoryController');

const categoryRouter = express.Router();

categoryRouter.get('/allCategories', getAllCategories); // Get all categories
categoryRouter.post('/createCategory/', createCategory); // Create a new category
categoryRouter.put('/updateCategory/:id', updateCategory); // Update a category by ID
categoryRouter.delete('/:id', deleteCategory); // Delete a category by ID
categoryRouter.get('/:id', getCategoryById); // Get category by ID

module.exports = categoryRouter;
