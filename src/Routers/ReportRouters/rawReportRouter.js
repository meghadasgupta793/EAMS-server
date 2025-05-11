const express = require('express');
const { getAttendanceRawData } = require('../../Controllers/ReportController/rawReportController');

const rawReportRouter = express.Router();

rawReportRouter.post('/getAttendanceRawData', getAttendanceRawData); // Create a new batch


module.exports = rawReportRouter;
