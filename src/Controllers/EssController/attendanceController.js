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
            .input('GeoLocation', GeoLocation ? `N'${GeoLocation}'` : null)
            .input('HeadPhoto', HeadPhoto )
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


const getEmployeePeriodAttendance = async (req, res, next) => {
    try {
        const { EmployeeID, FromDate, ToDate } = req.body;

        if (!EmployeeID || !FromDate || !ToDate) {
            return res.status(400).send({ message: "EmployeeID, FromDate, and ToDate are required" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("EmployeeID", sql.Int, EmployeeID)
            .input("FromDate", sql.Date, FromDate)
            .input("ToDate", sql.Date, ToDate)
            .query(`
                SELECT 
                    Date,
                    Attn.ShiftAllocated AS shiftCode,
                    FORMAT(Attn.InDateTime, 'HH:mm') AS inTime,
                    FORMAT(Attn.OutDateTime, 'HH:mm') AS outTime,
                	FORMAT(DATEADD(MINUTE, ISNULL(Attn.LateIn, 0), '00:00'), 'HH:mm') AS late,
                	FORMAT(DATEADD(MINUTE, ISNULL(Attn.EarlyOut, 0), '00:00'), 'HH:mm') AS early,
                    FORMAT(DATEADD(MINUTE, ISNULL(Attn.WorkingTime, 0), '00:00'), 'HH:mm') AS WorkHour,
                    CASE 
                        WHEN Attn.InDateTime IS NOT NULL AND ISNULL(Attn.LateIn, 0) = 0 AND ISNULL(Attn.EarlyOut, 0) = 0 THEN 'PP'
                        WHEN Attn.InDateTime IS NULL AND Attn.OutDateTime IS NULL AND Attn.ShiftAllocated <> 'WO' AND Attn.LeaveInfo IS NULL THEN 'AA'
                        WHEN Attn.InDateTime IS NOT NULL AND ISNULL(Attn.LateIn, 0) > 0 THEN 'Lt'
                        WHEN Attn.OutDateTime IS NOT NULL AND ISNULL(Attn.EarlyOut, 0) > 0 THEN 'EE'
                        WHEN Attn.ShiftAllocated = 'WO' AND Attn.InDateTime IS NULL AND Attn.OutDateTime IS NULL THEN 'WO'
                        WHEN Attn.LeaveInfo IS NOT NULL THEN 'LV'
                        ELSE Attn.AttendanceStatus
                    END AS status
                FROM [Attendance].[tblTAttendance] Attn
                WHERE 
                    EmployeeID = @EmployeeID
                    AND [Date] BETWEEN @FromDate AND @ToDate
                    order by Date
            `);

        const attendanceData = result.recordset.map(row => ({
            date: row.Date,
            shiftCode: row.shiftCode || null,
            inTime: row.inTime || null,
            outTime: row.outTime || null,
            WorkHour: row.WorkHour || "00:00:00",
            late:row.late || "00:00:00",
            early:row.early || "00:00:00",
            status: row.status
        }));

        const summary = {
            Present: 0,
            Absent: 0,
            Late: 0,
            Early: 0,
            "Week-off": 0,
            Holiday: 0,
            Leave: 0,
            Tour: 0
        };

        for (const record of attendanceData) {
            switch (record.status) {
                case 'PP':
                    summary.Present++;
                    break;
                case 'AA':
                    summary.Absent++;
                    break;
                case 'Lt':
                    summary.Late++;
                    break;
                case 'EE':
                    summary.Early++;
                    break;
                case 'WO':
                    summary["Week-off"]++;
                    break;
                case 'HO':
                    summary.Holiday++;
                    break;
                case 'LV':
                    summary.Leave++;
                    break;
                case 'TR':
                    summary.Tour++;
                    break;
                default:
                    break;
            }
        }

        res.status(200).send({
            ...summary,
            attendanceData
        });
    } catch (error) {
        console.error("SQL Error:", error);

        res.status(500).send({
            message: "SQL Error",
            error: error.originalError || error
        });
    }
};

module.exports = {employeeAttendanceMark , getEmployeePeriodAttendance };
