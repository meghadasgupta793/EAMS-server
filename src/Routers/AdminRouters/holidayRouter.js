const express = require('express');

const { 
    getAllHolidaysList, 
    createHolidayList, 
    updateHolidayList, 
    deleteHolidayList, 
    getAllHolidayGroup, 
    createHolidayGroup, 
    updateHolidayGroup, 
    deleteHolidayGroup, 
    getHolidayByGroupId, 
    assignHolidayInAHolidayGroup, 
    unAssignHolidayFromAHolidayGroup,
    getHolidayForAssing,
    getHolidayById
} = require('../../Controllers/AdminController/holidayController');

const holidayRouter = express.Router();

// Holiday List Routes
holidayRouter.get('/holidayList', getAllHolidaysList); // Get all holidays
holidayRouter.get('/holiday/:id', getHolidayById);
holidayRouter.post('/holidayCreate', createHolidayList); // Create a new holiday
holidayRouter.put('/updateHoliday/:id', updateHolidayList); // Update a holiday by ID
holidayRouter.delete('/:id', deleteHolidayList); // Delete a holiday by ID
holidayRouter.get('/holidayForAssing/:id', getHolidayForAssing); // Get  HolidayForAssing

// Holiday Group Routes
holidayRouter.get('/holidayGroup', getAllHolidayGroup); // Get all holiday groups
holidayRouter.post('/holidayGroup', createHolidayGroup); // Create a new holiday group
holidayRouter.put('/holidayGroup/:id', updateHolidayGroup); // Update a holiday group by ID
holidayRouter.delete('/holidayGroup/:id', deleteHolidayGroup); // Delete a holiday group by ID

// Holiday Assignment and Group Retrieval
holidayRouter.get('/holidayByGroup/:id', getHolidayByGroupId); // Get holidays by group ID
holidayRouter.post('/assignHolidayInAHolidayGroup', assignHolidayInAHolidayGroup); // Assign holiday to a group
holidayRouter.post('/unAssignHolidayFromAHolidayGroup', unAssignHolidayFromAHolidayGroup); // Unassign holiday from a group by Id







module.exports = holidayRouter;
