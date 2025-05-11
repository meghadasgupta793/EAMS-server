const express = require('express');
const { employeeAttendanceMark,getEmployeePeriodAttendance } = require('../../Controllers/EssController/attendanceController');


const attendanceRouter = express.Router();

attendanceRouter.post('/employeeAttendanceMark', employeeAttendanceMark); // Create a new batch
attendanceRouter.post('/getEmployeePeriodAttendance', getEmployeePeriodAttendance); // Create a new batch


module.exports = attendanceRouter;
