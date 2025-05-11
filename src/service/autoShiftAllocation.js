const { poolPromise } = require("../config/db");

const autoShiftAllocation = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SET DATEFIRST 1; -- Monday is day 1
DECLARE @ShiftDate DATE
DECLARE @DayNumber INT
SET @ShiftDate = CAST(DATEADD(DAY, 0, GETDATE()) AS DATE)
SET @DayNumber = DATEPART(WEEKDAY, @ShiftDate)

SELECT DISTINCT 
    ES.EmployeeID AS EmployeeID,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM [Attendance].[tblMHoliday] HO (NOLOCK)
            WHERE HO.ID = RHG.HolidayId 
            AND @ShiftDate BETWEEN HO.StartDate AND HO.EndDate
        ) THEN 'HO'
        ELSE 
            CASE 
                WHEN SUBSTRING(ES.AltShiftWO, @DayNumber, 1) = '1' THEN 'WO' 
                ELSE 'AA'
            END
    END AS AttendanceStatus,   
    CASE 
        WHEN SUBSTRING(ES.AltShiftWO, @DayNumber, 1) = '1' THEN 'WO' 
        ELSE 
            CASE 
                WHEN ES.ShiftType = 3 THEN (
                    SELECT TOP 1 Shift 
                    FROM Attendance.tblMSelectedShift SS
                    WHERE SS.AutoShiftID = ES.NonShiftGroup
                    ORDER BY SS.Shift
                )
                ELSE ES.Shift 
            END
    END AS ShiftAllocated
INTO #AttendanceData  -- Storing results temporarily for further insertion
FROM Attendance.tblMEmployeeShift (NOLOCK) ES
LEFT JOIN Attendance.tblMHolidayGroup (NOLOCK) HG on HG.ID = ES.HolidayGroupID
LEFT JOIN Attendance.tblRHolidayGroup (NOLOCK) RHG ON HG.ID = RHG.GroupID
WHERE NOT EXISTS (
    SELECT 1
    FROM Attendance.tblTAttendance ATT
    WHERE ATT.EmployeeID = ES.EmployeeID
    AND ATT.Date = @ShiftDate
);

-- Insert into tblTAttendance
INSERT INTO Attendance.tblTAttendance (ID, Date, EmployeeID, AttendanceStatus, ShiftAllocated, ApplicablePayFactor, CreatedOn)
SELECT NEWID(), @ShiftDate, EmployeeID, AttendanceStatus, ShiftAllocated, '1.00',GETDATE()
FROM #AttendanceData;

-- Clean up the temporary table
DROP TABLE #AttendanceData;
`);

        console.log("Shift Allocation Executed Successfully");

    } catch (error) {
        console.error("An error occurred during shift allocation:", error.message);
    }
};

module.exports = autoShiftAllocation;
