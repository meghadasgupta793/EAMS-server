const sql = require('mssql');
const { updateAttendance } = require('./updateAttendance');

const processFixedShift = async (attendanceRecord) => {
    const { EmployeeID, AttendanceDateTime, InOutMode: inputInOutMode, DeviceID } = attendanceRecord;

    let pool;

    try {
        pool = await sql.connect('your_connection_string');

        // Step 1: Determine the current day shift
        const currentShiftQuery = `
            SELECT ID as AttendanceID, EmployeeID, Date, ShiftAllocated, S.StartTime, S.EndTime
            FROM Attendance.tblTAttendance AT
            INNER JOIN Attendance.tblMShift S ON AT.ShiftAllocated = S.Code
            WHERE AT.Date = @AttendanceTime AND EmployeeID = @EmployeeID`;

        const { recordset: currentShift } = await pool.request()
            .input('AttendanceTime', sql.DateTime, AttendanceDateTime)
            .input('EmployeeID', sql.BigInt, EmployeeID)
            .query(currentShiftQuery);

        if (currentShift.length === 0) {
            console.log('No current shift found.');
            return;
        }

        const { AttendanceID: currentAttendanceID, StartTime: currentShiftStartTime } = currentShift[0];

        // Step 2: Determine the previous day shift
        const previousShiftQuery = `
            SELECT ID as AttendanceID, EmployeeID, Date, ShiftAllocated, S.StartTime, S.EndTime
            FROM Attendance.tblTAttendance AT
            INNER JOIN Attendance.tblMShift S ON AT.ShiftAllocated = S.Code
            WHERE AT.Date = DATEADD(day, -1, @AttendanceTime) AND EmployeeID = @EmployeeID`;

        const { recordset: previousShift } = await pool.request()
            .input('AttendanceTime', sql.DateTime, AttendanceDateTime)
            .input('EmployeeID', sql.BigInt, EmployeeID)
            .query(previousShiftQuery);

        const thresholdForIn = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        const previousShiftStartTime = previousShift.length > 0 
            ? new Date(new Date(previousShift[0].StartTime).getTime() - thresholdForIn) 
            : null;
        const previousShiftEndTime = previousShift.length > 0 ? previousShift[0].EndTime : null;

        const currentShiftStart = new Date(currentShiftStartTime).getTime() - thresholdForIn;

        // Step 4: Determine AttendanceID
        let AttendanceID = null;
        if (AttendanceDateTime.getTime() < currentShiftStart && previousShiftStartTime && previousShiftEndTime) {
            AttendanceID = previousShift[0].AttendanceID; // Previous day AttendanceID
        } else {
            AttendanceID = currentAttendanceID; // Current day AttendanceID
        }

        // Step 5: Handle InOutMode
        let InOutMode = inputInOutMode;
        if (![1, 2].includes(InOutMode)) {
            const previousPunchQuery = `
                SELECT TOP 1 ID, ProcessedInOutMode
                FROM attendance.tblTAttendanceData
                WHERE EmployeeID = @EmployeeID
                AND AttendanceID = @AttendanceID`;

            const { recordset: previousPunch } = await pool.request()
                .input('EmployeeID', sql.BigInt, EmployeeID)
                .input('AttendanceID', sql.UniqueIdentifier, AttendanceID)
                .query(previousPunchQuery);

            if (previousPunch.length > 0) {
                InOutMode = previousPunch[0].ProcessedInOutMode === 1 ? 2 : 1;
            } else {
                InOutMode=1
            }
        }

        // Call the updateAttendance function with the necessary parameters
        await updateAttendance(pool, attendanceRecord, AttendanceID, InOutMode);

    } catch (error) {
        console.error('Error processing attendance record:', error);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
};

module.exports = { processFixedShift };
