const express = require('express');
const authenticateToken = require("../../auth/authenticateToken ");
const multer = require('multer');
const { fileFilter, visitorImgStorage } = require('../../utils/fileHelper');
const { DashBoardAppointmentStatusCount, DashBoardAppointmentStatusDetails, VisitorInvitationOverView, VisitorInvitationOverViewDetails } = require('../../Controllers/VmsController/vmsDashBoardController');
const { VisitorApointmentCreate, approvedAppointment, checkInAppointment, checkOutAppointment, appointmentDetailsByAppointmentId, appointmentDetailsByDateRange, InviteVisitor } = require('../../Controllers/VmsController/vmsAppointmentController');
const { getVisitorAllVisitor, searchByVisitorMobileNo } = require('../../Controllers/VmsController/vmsVisitorController');


// Initialize upload variable
const upload = multer({
    storage: visitorImgStorage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: fileFilter
  });

  const vmsRouter = express.Router();


  /////DahaBord Rout//////
vmsRouter.post('/dashBoardAppointmentStatusCount',authenticateToken, DashBoardAppointmentStatusCount);
vmsRouter.post('/dashBoardAppointmentStatusDetails', authenticateToken, DashBoardAppointmentStatusDetails);

vmsRouter.post('/invitationOverView', authenticateToken,VisitorInvitationOverView);
vmsRouter.post('/invitationOverViewDetails', authenticateToken, VisitorInvitationOverViewDetails);



vmsRouter.post('/createAppointment',authenticateToken, upload.single('Photo'), VisitorApointmentCreate);
vmsRouter.get('/getAllVisitors', authenticateToken, getVisitorAllVisitor);
vmsRouter.get('/searchByVisitorMobileNo/:MobileNo', searchByVisitorMobileNo);

vmsRouter.post('/approvedAppointment',authenticateToken, approvedAppointment);
vmsRouter.post('/checkInAppointment', authenticateToken, upload.single('Photo'), checkInAppointment);
vmsRouter.post('/checkOutAppointment',authenticateToken, checkOutAppointment)
vmsRouter.get('/appointmentDetailsById/:AppointmentId', appointmentDetailsByAppointmentId);
vmsRouter.post('/inviteAppointment',authenticateToken,upload.single('Photo'),InviteVisitor)
vmsRouter.post('/appointmentDetailsByDateRange',authenticateToken, appointmentDetailsByDateRange);



module.exports = vmsRouter;