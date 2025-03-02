const { poolPromise, sql } = require("../../config/db");


const fs = require('fs');
const path = require('path');
const emailWithNodemailer = require('../../utils/emailSetup');

const uploadFolderPath = path.resolve(__dirname, '../../../public/images/visitor/');


const VisitorApointmentCreate = async (req, res, next) => {
    try {
        const {
            VisitorName,
            Email,
            IdentityType,
            IdentityNo,
            MobileNo,
            VisitorCompany,
            Address,
            AppDateFrom,
            AppDateTo,
            Purpose,
            CreatedByUserID,
            AppToEmpID
        } = req.body;

        const Photo = req.file ? req.file.filename : null;
        let base64Pic = null;

        if (Photo) {
            const filePath = path.join(uploadFolderPath, Photo);
            const fileBuffer = fs.readFileSync(filePath);
            base64Pic = fileBuffer.toString('base64');
        }

        // Input validation
        if (!VisitorName || !MobileNo || !AppToEmpID || !AppDateFrom || !AppDateTo ) {
            return res.status(400).send({
                message: "Appointment data is required"
            });
        }



        const pool = await poolPromise;
        const request = pool.request();
        // Set input parameters
        request.input('VisitorName', VisitorName);
        request.input('Email', Email);
        request.input('Photo', base64Pic);
        request.input('IdentityType', IdentityType);
        request.input('IdentityNo', IdentityNo);
        request.input('MobileNo', MobileNo);
        request.input('VisitorCompany', VisitorCompany);
        request.input('AddressLine1', Address);
        request.input('AppDateFrom',AppDateFrom);
        request.input('AppDateTo',AppDateTo);
        request.input('Purpose', Purpose);
        request.input('CreatedByUserID', CreatedByUserID);
        request.input('AppToEmpID', AppToEmpID);
        request.input('PictureName', Photo);

        // Execute stored procedure
        const result = await request.execute('VMS.spCreateAppointment');

        res.status(200).send({
            message: "Appointment created successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).send({
            message: "An error occurred while creating appointment",
            error: error.message
        });
        next(error);
    }
};




const approvedAppointment = async (req, res, next) => {
    try {
        const { ID, ApprovedByUserId } = req.body;

        // Fetch appointment record from the database
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ID', ID)
            .query('SELECT * FROM VMS.tblMAppointment WHERE ID = @ID');

        // If appointment record exists, update it
        if (result.recordset.length > 0) {
            await pool.request()
                .input('ID', ID)
                .input('ApprovedByUserId', ApprovedByUserId)
                .query(`
                    UPDATE VMS.tblMAppointment
                    SET AppointmentStatusId = 1, ApprovedByUserId = @ApprovedByUserId
                    WHERE ID = @ID;
                `);

            // Construct updated appointment object
            const appointment = { ...result.recordset[0], ApprovedByUserId: ApprovedByUserId, AppointmentStatusId: 1 };
            return res.json(appointment);
        } else {
            // If appointment record not found, return 404
            return res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        // Handle errors
        console.error('Database query error:', error);
        return res.status(500).json({
            message: 'An error occurred while approving the appointment',
            error: error.message
        });
    }
};

const checkInAppointment = async (req, res, next) => {
    try {
        const {
            AppointmentId,
            VisitorName,
            Email,
            IdentityType,
            IdentityNo,
            MobileNo,
            VisitorCompany,
            AddressLine1,
            VehicleTypeID,
            VehicleNo,
            AdditionalVisitorCount,
            AdditionalVisitorName,
            Gender,
            CheckInByUserID
           
        } = req.body;
        const Photo = req.file ? req.file.filename : null;
        let base64Pic = null;

        if (Photo) {
            const filePath = path.join(uploadFolderPath, Photo);
            const fileBuffer = fs.readFileSync(filePath);
            base64Pic = fileBuffer.toString('base64');
        }

        // Input validation
        if (!VisitorName || !MobileNo || !CheckInByUserID) {
            return res.status(400).send({
                message: "Check-in data is required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('AppointmentId', AppointmentId);
        request.input('VisitorName', VisitorName);
        request.input('Email', Email);
        request.input('Photo', base64Pic);
        request.input('IdentityType', IdentityType);
        request.input('IdentityNo', IdentityNo);
        request.input('MobileNo', MobileNo);
        request.input('VisitorCompany', VisitorCompany);
        request.input('AddressLine1', AddressLine1);
        request.input('VehicleTypeID', VehicleTypeID);
        request.input('VehicleNo', VehicleNo);
        request.input('AdditionalVisitorCount', AdditionalVisitorCount);
        request.input('AdditionalVisitorName', AdditionalVisitorName);
        request.input('Gender', Gender);
        request.input('CheckInByUserID', CheckInByUserID);
        request.input('PictureName', Photo);

        // Execute stored procedure
        const result = await request.execute('VMS.spCheckInAppointment');

        res.status(200).send({
            message: "Check-in completed successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error('Error to Check-in:', error);
        res.status(500).send({
            message: "An error occurred while Check-in",
            error: error.message
        });
        next(error);
    }
}


const checkOutAppointment = async(req,res,next)=> {
    const { AppointmentID, CheckOutByUserID } = req.body;
console.log(req.body)
    try {
        const pool = await poolPromise;
        const request = pool.request();

         // Input validation
       ///  if (!AppointmentId || !CheckOutByUserID) {
       ///     return res.status(400).send({
      ///          message: "Check-Out data is required"
      //      });
     ///   }


        request.input('AppointmentID', AppointmentID);
        request.input('CheckOutByUserID', CheckOutByUserID);

         // Execute stored procedure
         const result = await request.query(`update VMS.tblTCheckIn set CheckOutDateTime=getdate(),CheckOutByUserID=${CheckOutByUserID} where AppointmentID=${AppointmentID};update VMS.tblMAppointment set AppointmentStatusId=3  where ID=${AppointmentID}`);

         res.status(200).send({
             message: "Checked Out successfully",
              });
       
        }
       

     catch (error) {
        console.error('Error to Check-Out:', error);
        res.status(500).send({
            message: "An error occurred while Check-Out",
            error: error.message
        });
        next(error);
    }
}

const InviteVisitor = async (req, res, next) => {
    try {
      const {
        VisitorName,
        Email,
        IdentityType,
        IdentityNo,
        MobileNo,
        VisitorCompany,
        AddressLine1,
        AppDateFrom,
        AppDateTo,
        Purpose,
        CreatedByUserID,
        AppToEmpID
      } = req.body;
      const Photo = req.file ? req.file.filename : null;
      let base64Pic = null;
  
      if (Photo) {
        const filePath = path.join(uploadFolderPath, Photo);
        const fileBuffer = fs.readFileSync(filePath);
        base64Pic = fileBuffer.toString('base64');
      }
  
      if (!VisitorName || !MobileNo || !AppToEmpID || !AppDateFrom || !AppDateTo) {
        return res.status(400).send({
          message: "Appointment data is required"
        });
      }
  
      const pool = await poolPromise;
      const request = pool.request();
  
      request.input('VisitorName', VisitorName);
      request.input('Email', Email);
      request.input('Photo', base64Pic);
      request.input('IdentityType', IdentityType);
      request.input('IdentityNo', IdentityNo);
      request.input('MobileNo', MobileNo);
      request.input('VisitorCompany', VisitorCompany);
      request.input('AddressLine1', AddressLine1);
      request.input('AppDateFrom', AppDateFrom);
      request.input('AppDateTo', AppDateTo);
      request.input('Purpose', Purpose);
      request.input('CreatedByUserID', CreatedByUserID);
      request.input('AppToEmpID', AppToEmpID);
      request.input('PictureName', Photo);
  
      const result = await request.execute('VMS.spInviteVisitor');
      const emilPic = result.recordset[0].VisitorPhoto;
  
      res.status(200).send({
        message: "Appointment Invited successfully",
        data: result.recordset
      });
     
  
      const appointmentData = {
        VisitorName,
        MobileNo,
        VisitorCompany,
        CompanyName: 'NM EnterPrise',
        CompanyAddress: AddressLine1,
        EmployeeName: AppToEmpID,
        Department: 'Admin',
        StartTime: AppDateFrom,
        EndTime: AppDateTo,
        VisitorPhoto: emilPic,
      };

      //console.log('Base:',emilPic)
  
      // Generate HTML content for the Visitor Card
      const htmlContent = `
      <div style="max-width: 400px; margin: auto; border: 1px solid #c0c0c0; border-radius: 10px; overflow: hidden;">
        <div style="background: #c0c0c0; color: #FFFFFF; padding: 16px; text-align: center;">
            <img src="data:image/png;base64,${appointmentData.VisitorPhoto}" alt="Visitor Photo" style="width: 50px; height: 50px; border-radius: 10px;" />
            <h2 style="margin: 0;">${appointmentData.VisitorCompany}</h2>
          <p style="margin: 0;">${appointmentData.CompanyAddress}</p>
        </div>
        <div style="padding: 16px;">
          <p><strong>Visitor Name:</strong> ${appointmentData.VisitorName}</p>
          <p><strong>Visitor Mobile:</strong> ${appointmentData.MobileNo}</p>
          <p><strong>Company Name:</strong> ${appointmentData.CompanyName}</p>
          <p><strong>Appointment with:</strong> ${appointmentData.EmployeeName}</p>
          <p><strong>Department:</strong> ${appointmentData.Department}</p>
          <p><strong>Start Time:</strong> ${appointmentData.StartTime}</p>
          <p><strong>End Time:</strong> ${appointmentData.EndTime}</p>
        </div>
        <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0;">Visitor Signature</p>
            <div style="border-bottom: 1px solid black; margin: 16px 0;"></div>
          </div>
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0;">Appointee Signature</p>
            <div style="border-bottom: 1px solid black; margin: 16px 0;"></div>
          </div>
        </div>
      </div>
    `;
    
    
  
      const emailData = {
        Email,
        subject: 'Appointment Confirmation',
        html: `
          <p>Dear ${VisitorName},</p>
          <p>Your appointment has been scheduled from ${AppDateFrom} to ${AppDateTo}.</p>
          <p>Please find your visitor card below:</p>
          ${htmlContent}
          <p>Thank you,<br>NM EnterPrise/p>
        `
      };
  
      try {
        await emailWithNodemailer(emailData);
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        return res.status(500).send({
          message: 'Failed to send invitation email',
          error: emailError.message
        });
      }
  
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).send({
        message: "An error occurred while creating appointment",
        error: error.message
      });
      next(error);
    }
  };

  const appointmentDetailsByAppointmentId = async (req, res, next) => {
    try {
        const { AppointmentId } = req.params; // Fixed: req.Params ➔ req.params

        if (!AppointmentId) {
            return res.status(400).send({
                message: "AppointmentId is required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('AppointmentId', AppointmentId);

        // Execute stored procedure
        const result = await request.execute('VMS.spLAppointmentDetailsStatusByID');

        res.status(200).send({
            message: "Appointment Details are returned",
            data: result.recordset
        });

    } catch (error) {
        // ❌ Removed next(error) to avoid duplicate response
        res.status(500).send({
            message: "An error occurred while retrieving Appointment Details",
            error: error.message
        });
    }
};


const appointmentDetailsByDateRange = async(req,res,next)=>{
    try {
        const { UserRole,EmployeeId,StartDate,EndDate} = req.body;


        // Logging to verify request body
       // console.log("Request Body:", req.body);


        if (!UserRole,!EmployeeId,!StartDate,!EndDate ) {
            return res.status(400).send({
                message: "Some Parameter is missing"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole); 
        request.input('EmployeeId', EmployeeId); 
        request.input('StartDate', StartDate); 
        request.input('EndDate', EndDate);     


        // Execute stored procedure
        const result = await request.execute('VMS.spLAppointmentDetailsbyDateRange');

        res.status(200).send({
            message: "Appoint Details  are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving Appoint Details",
            error: error.message
        });
        next(error);
    }
}



module.exports = {
    VisitorApointmentCreate,
    approvedAppointment,
    checkInAppointment,
    checkOutAppointment,
    InviteVisitor,
    appointmentDetailsByAppointmentId,
    appointmentDetailsByDateRange
}
