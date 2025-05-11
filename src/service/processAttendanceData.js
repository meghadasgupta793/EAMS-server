const { poolPromise, sql } = require("../config/db");
const processFlexiShift = require('./processFlexiShift');
const processFixedShift = require('./processFixedShift');
const processAutoShift = require('./processAutoShift');

async function processAttendanceData(param1 = '50') {
    try {
        

        // Connect to the database
        const pool = await poolPromise;

        // Retrieve unprocessed attendance data
        const query = `
            SELECT TOP 50 ID, EmployeeID, PunchTime, InOutMode, DeviceID
            FROM Attendance.tbltattendanceData (NOLOCK)
            WHERE AttendanceID IS NULL
            ORDER BY PunchTime`;

        const { recordset: attendanceData } = await pool.request().query(query);

        // Loop through each record
        for (let record of attendanceData) {
            const { ID: attendanceDataID, EmployeeID, PunchTime, InOutMode, DeviceID } = record;

            try {
                // Retrieve Employee's Shift Type
                const { recordset: EmployeeShiftType } = await pool.request()
                    .input('EmployeeID', sql.BigInt, EmployeeID)
                    .query("SELECT ShiftType FROM [Attendance].[tblMEmployeeShift] where EmployeeID = @EmployeeID");

                const ShiftType = EmployeeShiftType[0]?.ShiftType || 1; // Default to 1 if ShiftType is null/undefined

                // Call the appropriate function based on ShiftType
                if (ShiftType === 2) {
                    await processFlexiShift({
                        attendanceDataID,
                        EmployeeID,
                        PunchTime,
                        InOutMode,
                        DeviceID
                    });
                } else if (ShiftType === 3) {
                    await processAutoShift({
                        attendanceDataID,
                        EmployeeID,
                        PunchTime,
                        InOutMode,
                        DeviceID
                    });
                } else {
                    await processFixedShift({
                        attendanceDataID,
                        EmployeeID,
                        PunchTime,
                        InOutMode,
                        DeviceID
                    });
                }
            } catch (error) {
                console.error(`Error processing record (ID: ${attendanceDataID}, EmployeeID: ${EmployeeID}):`, error);
            }
        }

    } catch (err) {
        console.error('Error processing attendance data:', err);
    }
}

module.exports = processAttendanceData;