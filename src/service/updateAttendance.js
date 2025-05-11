const updateAttendance = async (pool, attendanceRecord, AttendanceID, InOutMode) => {
    const { EmployeeID, AttendanceDateTime, DeviceID } = attendanceRecord;

    try {
        const todayAttendanceQuery = `
            SELECT AT.ID ID, AT.Date Date, InDateTime, OutDateTime, LastPunchDateTime, 
                   ShiftAllocated, S.LateCalculatedFrom, S.EarlyExitBefore, S.StartTime, S.EndTime
            FROM attendance.tblTAttendance AT
            INNER JOIN attendance.tblMShift S ON AT.ShiftAllocated = S.Code
            WHERE EmployeeID = @EmployeeID
            AND AttendanceID = @AttendanceID`;

        const { recordset: todayAttendance } = await pool.request()
            .input('EmployeeID', sql.BigInt, EmployeeID)
            .input('AttendanceID', sql.UniqueIdentifier, AttendanceID)
            .query(todayAttendanceQuery);

        if (todayAttendance.length > 0) {
            const ShiftAllocated = todayAttendance[0].ShiftAllocated;
            const InDateTime = todayAttendance[0].InDateTime;
            const datePart = todayAttendance[0].Date;
            const lateCalculatedFromTime = todayAttendance[0].LateCalculatedFrom;
            const earlyExitBeforeTime = todayAttendance[0].EarlyExitBefore;
            const startTime = todayAttendance[0].StartTime;
            const endTime = todayAttendance[0].EndTime;

            let lateInMinute = 0;
            if (datePart && lateCalculatedFromTime) {
                const LateCalculatedFrom = new Date(`${datePart}T${lateCalculatedFromTime}`);
                const LateInMilliseconds = LateCalculatedFrom - AttendanceDateTime;
                const lateInDiffMinutes = Math.floor(LateInMilliseconds / 1000 / 60);

                // Only consider positive differences
                if (lateInDiffMinutes > 0) {
                    lateInMinute = lateInDiffMinutes;
                }
            }

            let EarlyInMinute = 0;
            if (startTime > endTime) { // Check if the shift crosses midnight
                if (datePart && earlyExitBeforeTime) {
                    let EarlyExitBefore = new Date(`${datePart}T${earlyExitBeforeTime}`);
                    // Add one day to the date
                    EarlyExitBefore.setDate(EarlyExitBefore.getDate() + 1);

                    const EarlyInMilliseconds = AttendanceDateTime - EarlyExitBefore;
                    const EarlyInDiffMinutes = Math.floor(EarlyInMilliseconds / 1000 / 60);
                    if (EarlyInDiffMinutes > 0) {
                        EarlyInMinute = EarlyInDiffMinutes;
                    }
                } else {
                    console.error('Invalid date or time for EarlyExitBefore');
                }
            } else {
                if (datePart && earlyExitBeforeTime) {
                    const EarlyExitBefore = new Date(`${datePart}T${earlyExitBeforeTime}`);
                    const EarlyInMilliseconds = AttendanceDateTime - EarlyExitBefore;
                    const EarlyInDiffMinutes = Math.floor(EarlyInMilliseconds / 1000 / 60);
                    if (EarlyInDiffMinutes > 0) {
                        EarlyInMinute = EarlyInDiffMinutes;
                    }
                } else {
                    console.error('Invalid date or time for EarlyExitBefore');
                }
            }

            let WorkTime = 0;
            if (InOutMode === 1 && AttendanceDateTime < InDateTime) {
                await pool.request()
                    .input('AttendanceTime', sql.DateTime, AttendanceDateTime)
                    .input('DeviceID', sql.Int, DeviceID)
                    .input('AttendanceID', sql.UniqueIdentifier, AttendanceID)
                    .input('lateInMinute', sql.Int, lateInMinute)
                    .input('ShiftAllocated', sql.VarChar, ShiftAllocated)
                    .query(`
                        UPDATE attendance.tblTAttendance 
                        SET InDateTime = @AttendanceTime, LateIn = @lateInMinute, InDeviceID = @DeviceID, ShiftReported = @ShiftAllocated
                        WHERE ID = @AttendanceID`);
            } else if (InOutMode === 1 && AttendanceDateTime > InDateTime && AttendanceDateTime > todayAttendance[0].LastPunchDateTime) {
                await pool.request()
                    .input('AttendanceTime', sql.DateTime, AttendanceDateTime)
                    .input('DeviceID', sql.Int, DeviceID)
                    .input('AttendanceID', sql.UniqueIdentifier, AttendanceID)
                    .query(`
                        UPDATE attendance.tblTAttendance 
                        SET LastPunchDateTime = @AttendanceTime
                        WHERE ID = @AttendanceID`);
            } else if (InOutMode === 2 && AttendanceDateTime > todayAttendance[0].OutDateTime && AttendanceDateTime > todayAttendance[0].LastPunchDateTime) {
                const WorkTimeInMilliseconds = AttendanceDateTime - new Date(InDateTime).getTime();
                const WorkTimeDiffMinutes = Math.floor(WorkTimeInMilliseconds / 1000 / 60);

                // Only consider positive differences
                WorkTime = Math.max(WorkTimeDiffMinutes, 0);

                await pool.request()
                    .input('AttendanceTime', sql.DateTime, AttendanceDateTime)
                    .input('DeviceID', sql.Int, DeviceID)
                    .input('AttendanceID', sql.UniqueIdentifier, AttendanceID)
                    .input('WorkTime', sql.Int, WorkTime)
                    .input('EarlyInMinute', sql.Int, EarlyInMinute)
                    .query(`
                        UPDATE attendance.tblTAttendance 
                        SET OutDateTime = @AttendanceTime, EarlyExit = @EarlyInMinute, OutDeviceID = @DeviceID, LastPunchDateTime = @AttendanceTime, WorkTime = @WorkTime
                        WHERE ID = @AttendanceID`);
            } else {
                console.log("Conditions not met for updating attendance.");
            }
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
    }
};

module.exports = { updateAttendance };
