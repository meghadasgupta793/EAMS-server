const express = require('express');
const { 
    getAllShift, 
    createShift, 
    updateShift, 
    deleteShift, 
    getAllAutoShiftGroup, 
    createAutoShiftGroup, 
    assignAutoShiftSchema,  // Added the new controller function here
    getShiftyId,
    unAssignAutoShiftSchema,
    deleteAutoShiftGroup,
    getShiftForAssigment
} = require('../../Controllers/AdminController/shiftController');

const shiftRouter = express.Router();

// Routes for managing shifts
shiftRouter.get('/allShifts', getAllShift); // Get all shifts
shiftRouter.get('/getShift/:Code', getShiftyId); // Get all shifts
shiftRouter.post('/createShift', createShift); // Create a new shift
shiftRouter.put('/updateShift/:Code', updateShift); // Update a shift
shiftRouter.delete('/:shiftCode', deleteShift); // Delete a shift

// Routes for Auto Shift Group
shiftRouter.get('/autoShiftGroup', getAllAutoShiftGroup);  // Get all Auto Shift Group
shiftRouter.post('/autoShiftGroup', createAutoShiftGroup); // Create Auto Shift Group
shiftRouter.delete('/autoShiftGroup/:id', deleteAutoShiftGroup); // Create Auto Shift Group

// Route for Assigning Auto Shift Schema
shiftRouter.get('/getShiftForAssigment/:id', getShiftForAssigment); // Get all shifts
shiftRouter.post('/assignAutoShift', assignAutoShiftSchema); // Assign Auto Shift Schema
shiftRouter.post('/unAssignAutoShift', unAssignAutoShiftSchema); // Assign Auto Shift Schema

module.exports = shiftRouter;
