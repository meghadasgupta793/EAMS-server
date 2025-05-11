const express = require('express');

const { dashBoardTypeWiseAttendanceDeatails, dashBoardTypeWiseCount, dashBoardLatestAttendance } = require('../../Controllers/AdminController/dashBoardController');
const authenticateToken = require('../../auth/authenticateToken ');

const adminDashboardRouter = express.Router();

adminDashboardRouter.post('/dashBoardTypeWiseAttendanceDeatails',authenticateToken, dashBoardTypeWiseAttendanceDeatails); // Get all batches
adminDashboardRouter.post('/dashBoardTypeWiseCount',authenticateToken, dashBoardTypeWiseCount); // Create a new batch
adminDashboardRouter.get('/dashBoardLatestAttendance',authenticateToken, dashBoardLatestAttendance); // Create a new batch


module.exports = adminDashboardRouter;
