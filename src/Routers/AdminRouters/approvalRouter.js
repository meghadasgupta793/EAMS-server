const express = require('express');
const { approverMapping, getReportingLists, myTeamToday, unAssignedReporteeList } = require('../../Controllers/AdminController/approvalSetupController');

const approvalRouter = express.Router();

approvalRouter.post('/approverMapping', approverMapping); // Create a new batch
approvalRouter.get('/reportnigList/:EmployeeID', getReportingLists); // Create a new batch
approvalRouter.get('/myTeamToday/:id', myTeamToday); // Create a new batch
approvalRouter.post('/unAssignedReporteeList', unAssignedReporteeList);

module.exports = approvalRouter;