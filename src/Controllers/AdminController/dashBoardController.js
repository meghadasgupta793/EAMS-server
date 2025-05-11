const { poolPromise, sql } = require("../../config/db");

const dashBoardTypeWiseCount = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date } = req.body;

        // Logging to verify request body
        console.log("Request Body:", req.body);

        if (!UserRole || !EmployeeId || !date) {
            return res.status(400).send({
                message: "UserRole, EmployeeId, and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);

        // Execute stored procedure
        const result = await request.execute('Attendance.spLDashBoardTypeWiseCount');

        res.status(200).send({
            message: "Attendance Summary returned successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error("Error in dashBoardTypeWiseCount:", error.message);
        res.status(500).send({
            message: "An error occurred while retrieving Attendance Summary",
            error: error.message
        });
        next(error);
    }
};

const dashBoardTypeWiseAttendanceDeatails = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date, AttenddanceStatus } = req.body;

        // Logging to verify request body
        console.log("Request Body:", req.body);

        if (!UserRole || !EmployeeId || !date || !AttenddanceStatus) {
            return res.status(400).send({
                message: "UserRole, EmployeeId, Date, and AttenddanceStatus are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);
        request.input('AttenddanceStatus', AttenddanceStatus); // Corrected parameter name

        // Execute stored procedure
        const result = await request.execute('Attendance.spLDashBoardTypeWiseAttendanceDeatails');

        res.status(200).send({
            message: "Attendance Details returned successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error("Error in dashBoardTypeWiseAttendanceDeatails:", error.message);
        res.status(500).send({
            message: "An error occurred while retrieving Attendance Details",
            error: error.message
        });
        next(error);
    }
};


const dashBoardLatestAttendance = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT TOP (100)
    ROW_NUMBER() OVER (ORDER BY PunchTime DESC) AS id,
    EmpNo,
    EmployeeName,
    PictureName,
    FORMAT(PunchTime, 'dd-MM-yyyy hh:mm') AS PunchTime
FROM [EAMS].[Attendance].[tblTAttendanceData] AD
INNER JOIN tblMEmployee E ON AD.EmployeeID = E.id`);

        res.status(200).send({
            message: "LatestAttendance are returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving LatestAttendance",
            error: error.message
        });
        next(error);
    }
};

module.exports = {
    dashBoardTypeWiseAttendanceDeatails,
    dashBoardTypeWiseCount,
    dashBoardLatestAttendance
};