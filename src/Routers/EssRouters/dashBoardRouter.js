const express = require('express');
const { getEmployeeUpcomingHolidays, occasionsContorller } = require('../../Controllers/EssController/essDashBoardController');


const essDashBoardRouter = express.Router();


essDashBoardRouter.post('/getEmployeeUpcomingHolidays', getEmployeeUpcomingHolidays); 
essDashBoardRouter.get('/getoccasions', occasionsContorller); 

module.exports = essDashBoardRouter;
