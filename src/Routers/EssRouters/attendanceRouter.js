const express = require('express');
const { employeeAttendanceMark } = require('../../Controllers/EssController/attendanceController');


const attendanceRouter = express.Router();

attendanceRouter.post('/employeeAttendanceMark', employeeAttendanceMark); // Create a new batch


module.exports = attendanceRouter;
