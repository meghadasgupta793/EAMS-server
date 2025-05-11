const { poolPromise, sql } = require("../config/db");

async function processFlexiShift({ attendanceDataID, EmployeeID, PunchTime, InOutMode, DeviceID }) {
    const pool = await poolPromise;

    try {
        // Validate input parameters
        if (!attendanceDataID || !EmployeeID || !PunchTime || !DeviceID) {
            throw new Error("Invalid input parameters");
        }

        // Retrieve FlexiShift settings
        const { flexiShiftMaxCutOffForOut, flexiShiftMaxThresholdForIn } = await getFlexiShiftSettings(pool);

        // Reprocess queue if processed data found after the current punch
        const reprocessQueue = await getReprocessQueue(pool, EmployeeID, PunchTime);
        if (reprocessQueue.length > 0) {
            await unprocessAttendanceData(pool, reprocessQueue);
        }

        // Determine InOutMode and update attendance records
        let attendanceID = null;
        let previousInPunchResult = null;
        let previousOutPunchResult = null;

        if (![1, 2].includes(InOutMode)) {
            const previousPunch = await getPreviousPunch(pool, EmployeeID, PunchTime);
            if (previousPunch.length > 0) {
                const { InDateTime, OutDateTime, ID, Date, ProcessedInOutMode } = previousPunch[0];
                previousInPunchResult = InDateTime;
                previousOutPunchResult = OutDateTime;

                InOutMode = determineInOutMode(
                    ProcessedInOutMode,
                    Date,
                    PunchTime,
                    InDateTime,
                    flexiShiftMaxCutOffForOut,
                    flexiShiftMaxThresholdForIn
                );
                attendanceID = ID;
            } else {
                InOutMode = 1;
            }
        }

        if (!attendanceID) {
            attendanceID = await getOrCreateAttendanceRecord(pool, EmployeeID, PunchTime, InOutMode);
        }

        if (attendanceID) {
            await updateAttendanceRecord(pool, attendanceID, PunchTime, InOutMode, previousInPunchResult);
            await updateAttendanceData(pool, attendanceDataID, InOutMode, attendanceID);
        }
    } catch (error) {
        console.error('Error processing FlexiShift:', error);
        throw error;
    }
}

// Helper Functions

/**
 * Retrieves FlexiShift settings from the database.
 */
async function getFlexiShiftSettings(pool) {
    const settingsQuery = `
        SELECT Name, value 
        FROM tblSSetting 
        WHERE Name IN ('AttendanceShiftMaxCutOffForOut', 'AttendanceShiftMaxThresholdForIn')`;
    const { recordset: settings } = await pool.request().query(settingsQuery);

    const flexiShiftMaxCutOffForOut = settings.find(s => s.Name === 'AttendanceShiftMaxCutOffForOut')?.value || 0;
    const flexiShiftMaxThresholdForIn = settings.find(s => s.Name === 'AttendanceShiftMaxThresholdForIn')?.value || 0;

    return { flexiShiftMaxCutOffForOut, flexiShiftMaxThresholdForIn };
}

/**
 * Retrieves the reprocess queue for attendance data.
 */
async function getReprocessQueue(pool, EmployeeID, PunchTime) {
    const reprocessQueueQuery = `
        SELECT ID, AttendanceID 
        FROM Attendance.tblTAttendanceData 
        WHERE PunchTime > @PunchTime
        AND EmployeeID = @EmployeeID
        AND AttendanceID IS NOT NULL`;

    const { recordset: reprocessQueue } = await pool.request()
        .input('PunchTime', sql.DateTime, PunchTime)
        .input('EmployeeID', sql.BigInt, EmployeeID)
        .query(reprocessQueueQuery);

    return reprocessQueue;
}

/**
 * Unprocesses attendance data by resetting its status.
 */
async function unprocessAttendanceData(pool, reprocessQueue) {
    const idsToReprocess = reprocessQueue.map(item => item.ID);
    const attendanceIdsToReprocess = reprocessQueue.map(item => item.AttendanceID);

    await pool.request()
        .input('idsToReprocess', sql.VarChar, idsToReprocess.join(','))
        .query(`
            UPDATE Attendance.tblTAttendanceData  
            SET ProcessedInOutMode = NULL, AttendanceID = NULL, Remarks = NULL, 
                AttendanceDate = CONVERT(DATE, PunchTime), ProcessFlag = NULL
            WHERE ID IN (SELECT value FROM STRING_SPLIT(@idsToReprocess, ','))
        `);

    await pool.request()
        .input('attendanceIdsToReprocess', sql.VarChar, attendanceIdsToReprocess.join(','))
        .query(`
            UPDATE tblTAttendance 
            SET InDateTime = NULL, OutDateTime = NULL, LastPunchDateTime = NULL,
                LateIn = NULL, EarlyOut = NULL, 
                AttendanceStatus = CASE 
                    WHEN ShiftAllocated = 'WO' THEN 'AA  WO      ' 
                    ELSE 'AA          '
                END,
                ShiftReported = NULL, WorkingTime = NULL, EndExtraTime = NULL, 
                EntryExtraTime = NULL, OverTime = NULL 
            WHERE ID IN (SELECT value FROM STRING_SPLIT(@attendanceIdsToReprocess, ','))
        `);
}

/**
 * Retrieves the previous punch data for the employee.
 */
async function getPreviousPunch(pool, EmployeeID, PunchTime) {
    const previousPunchQuery = `
        SELECT TOP 1 
            ATT.InDateTime,
            ATT.OutDateTime, 
            ATT.ID, 
            ATT.Date, 
            AD.PunchTime, 
            AD.ProcessedInOutMode 
        FROM Attendance.tblTAttendanceData (NOLOCK) AD
        LEFT JOIN Attendance.tblTAttendance (NOLOCK) ATT 
            ON AD.AttendanceID = ATT.ID
        WHERE AD.EmployeeID = @EmployeeID 
        AND PunchTime < @PunchTime 
        AND PunchTime > DATEADD(day, -2, @PunchTime)
        ORDER BY PunchTime DESC`;

    const { recordset: previousPunch } = await pool.request()
        .input('EmployeeID', sql.BigInt, EmployeeID)
        .input('PunchTime', sql.DateTime, PunchTime)
        .query(previousPunchQuery);

    return previousPunch;
}

/**
 * Determines the InOutMode based on previous punch data and settings.
 */
function determineInOutMode(previousInOutMode, previousAttnDate, PunchTime, previousFirstPunch, flexiShiftMaxCutOffForOut, flexiShiftMaxThresholdForIn) {
    if (previousInOutMode == null) {
        return 1;
    } else if (previousAttnDate === new Date(PunchTime).toLocaleDateString()) {
        return previousInOutMode === 1 ? 2 : 1;
    } else if (previousInOutMode === 1 && new Date(PunchTime).getTime() <= new Date(previousFirstPunch).getTime() + flexiShiftMaxCutOffForOut * 60000) {
        return 2;
    } else if (previousInOutMode === 2 && new Date(PunchTime).getTime() <= new Date(previousFirstPunch).getTime() + flexiShiftMaxThresholdForIn * 60000) {
        return 1;
    } else {
        return 1;
    }
}

/**
 * Retrieves or creates an attendance record for the employee.
 */
async function getOrCreateAttendanceRecord(pool, EmployeeID, PunchTime, InOutMode) {
    const { recordset: todayAttendance } = await pool.request()
        .input('EmployeeID', sql.BigInt, EmployeeID)
        .input('PunchTime', sql.DateTime, PunchTime)
        .query(`
            SELECT ID FROM Attendance.tblTAttendance 
            WHERE EmployeeID = @EmployeeID 
            AND Date = CONVERT(date, @PunchTime)
        `);

    if (todayAttendance.length > 0) {
        return todayAttendance[0].ID;
    } else {
        const insertAttendanceQuery = `
            INSERT INTO Attendance.tblTAttendance (
                ID, EmployeeID, Date, InDateTime, OutDateTime, LastPunchDateTime, 
                LateIn, EarlyOut, EntryExtraTime, EndExtraTime, AttendanceStatus, 
                ShiftReported, WorkingTime, CreatedOn, LeaveInfo, ApplicablePayFactor
            )
            OUTPUT INSERTED.ID
            VALUES (
                NEWID(), @EmployeeID, CONVERT(date, @PunchTime), 
                @InDateTime, @OutDateTime, @LastPunchDateTime, 
                0, 0, 0, 0, 'P', '--', 0, GETDATE(), NULL, 1
            )`;

        const { recordset: insertedAttendance } = await pool.request()
            .input('EmployeeID', sql.BigInt, EmployeeID)
            .input('PunchTime', sql.DateTime, PunchTime)
            .input('InDateTime', sql.DateTime, InOutMode === 1 ? PunchTime : null)
            .input('OutDateTime', sql.DateTime, InOutMode === 2 ? PunchTime : null)
            .input('LastPunchDateTime', sql.DateTime, PunchTime)
            .query(insertAttendanceQuery);

        return insertedAttendance[0].ID;
    }
}

/**
 * Updates the attendance record based on the InOutMode.
 */

async function updateAttendanceRecord(pool, attendanceID, PunchTime, InOutMode) {
   try {
       // Fetch the InDateTime for the given attendanceID
       const { recordset: attendanceRecord } = await pool.request()
           .input('AttendanceID', sql.UniqueIdentifier, attendanceID)
           .query(`
               SELECT InDateTime 
               FROM Attendance.tblTAttendance 
               WHERE ID = @AttendanceID
           `);

       // Extract the previousInPunchResult from the query result
       const previousInPunchResult = attendanceRecord[0]?.InDateTime || null;

       // Update the attendance record based on the InOutMode
       if (InOutMode === 1 && (previousInPunchResult === null || new Date(previousInPunchResult) > new Date(PunchTime))) {
           await pool.request()
               .input('PunchTime', sql.DateTime, PunchTime)
               .input('AttendanceID', sql.UniqueIdentifier, attendanceID)
               .query(`
                   UPDATE Attendance.tblTAttendance 
                   SET InDateTime = @PunchTime, LastPunchDateTime = @PunchTime, AttendanceStatus = 'PX'
                   WHERE ID = @AttendanceID
               `);
       } else if (InOutMode === 2) {
           await pool.request()
               .input('PunchTime', sql.DateTime, PunchTime)
               .input('AttendanceID', sql.UniqueIdentifier, attendanceID)
               .input('previousInPunchResult', sql.DateTime, previousInPunchResult)
               .query(`
                   UPDATE Attendance.tblTAttendance 
                   SET OutDateTime = @PunchTime, LastPunchDateTime = @PunchTime, AttendanceStatus = 'PP',
                   WorkingTime = DATEDIFF(MINUTE, @previousInPunchResult, @PunchTime)
                   WHERE ID = @AttendanceID
               `);
       }
   } catch (error) {
       console.error('Error updating attendance record:', error);
       throw error; // Re-throw the error for further handling
   }
}

/**
 * Updates the attendance data with the processed InOutMode and AttendanceID.
 */
async function updateAttendanceData(pool, attendanceDataID, InOutMode, attendanceID) {
    await pool.request()
        .input('AttendanceDataID', sql.UniqueIdentifier, attendanceDataID)
        .input('InOutMode', sql.Int, InOutMode)
        .input('AttendanceID', sql.UniqueIdentifier, attendanceID)
        .query(`
            UPDATE Attendance.tblTAttendanceData 
            SET AttendanceID = @AttendanceID, ProcessedInOutMode = @InOutMode 
            WHERE ID = @AttendanceDataID
        `);
}

module.exports = processFlexiShift;