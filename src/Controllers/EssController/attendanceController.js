const { poolPromise, sql } = require("../../config/db");




const employeeAttendanceMark = async (req, res, next) => {
    try {
        const { EmployeeID, PunchTime,InOutMode,Latitude,Longitude,GeoLocation,HeadPhoto } = req.body;
        if (!EmployeeID || !PunchTime) {
            return res.status(400).send({ message: "EmployeeID and PunchTime are required" });
        }

        const pool = await poolPromise;
        const checkCode = await pool.request()
            .input('EmployeeID',  EmployeeID)
            .query('SELECT * FROM tblMEmployee WHERE id = @EmployeeID');

        if (checkCode.recordset.length > 1) {
            return res.status(400).send({ message: `Employee Not Found with this Id: '${EmployeeID}' ` });
        }

        await pool.request()
            .input('EmployeeID', EmployeeID)
            .input('InOutMode',  InOutMode)
            .input('Latitude',  Latitude)
            .input('Longitude',  Longitude)
            .input('GeoLocation',  GeoLocation)
            .input('HeadPhoto',  HeadPhoto)
            .query(` insert into [Attendance].[tblTAttendanceData] 
                    (id,EmployeeID,AttendanceDate,PunchTime,InOutMode,WorkCode,
                     DeviceID,Latitude,Longitude,GeoLocation,HeadPhoto,CreatedBy,CreatedOn)
                     values (newid(),@EmployeeID,CONVERT(date,getdate()),getdate(),@InOutMode,
                     '00','2',@Latitude,@Longitude,@GeoLocation,@HeadPhoto,1,getdate())`);

        res.status(201).send({
            message: "Attendance Request Sucessfull ",
            data: { EmployeeID, PunchTime }
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while Marking the Attendance",
            error: error.message
        });
        next(error);
    }
};



module.exports = {employeeAttendanceMark };
