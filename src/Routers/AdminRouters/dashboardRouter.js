const express = require('express');
const { dashBoardTypeWiseAttendanceDeatails, dashBoardTypeWiseCount, dashBoardLatestAttendance } = require('../../Controllers/AdminController/dashBoardController');

const adminDashboardRouter = express.Router();

adminDashboardRouter.post('/dashBoardTypeWiseAttendanceDeatails', dashBoardTypeWiseAttendanceDeatails); // Get all batches
adminDashboardRouter.post('/dashBoardTypeWiseCount', dashBoardTypeWiseCount); // Create a new batch
adminDashboardRouter.get('/dashBoardLatestAttendance', dashBoardLatestAttendance); // Create a new batch


module.exports = adminDashboardRouter;
