const express = require('express');
const { 
    createBatch, 
    updateBatch, 
    deleteBatch, 
    getBatchById, 
    getAllBatches
} = require('../../Controllers/AdminController/batchController');

const batchRouter = express.Router();

batchRouter.get('/allBatches', getAllBatches); // Get all batches
batchRouter.post('/createBatch', createBatch); // Create a new batch
batchRouter.put('/updateBatch/:id', updateBatch); // Update a batch by ID
batchRouter.delete('/:id', deleteBatch); // Delete a batch by ID
batchRouter.get('/:id', getBatchById); // Get batch by ID

module.exports = batchRouter;
