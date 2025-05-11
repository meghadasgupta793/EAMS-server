const express = require('express');
const { empDateWiseReport } = require('../../Controllers/ReportController/attendanceReportController');

const attendanceReportRouter = express.Router();

attendanceReportRouter.post('/empDateWiseReport', empDateWiseReport);

module.exports = attendanceReportRouter;