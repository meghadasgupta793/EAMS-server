const { poolPromise, sql } = require("../../config/db");

const getEmployeeUpcomingHolidays = async (req, res, next) => {
    try {
        const { EmployeeID } = req.body;

        if (!EmployeeID) {
            return res.status(400).send({ message: "EmployeeID is required" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("EmployeeID",  EmployeeID)
            .input("TodayDate", sql.Date, new Date()) // Pass today's date as Date type (without time)
            .query(`
                SELECT 
                    HO.ID,
                    HO.Name,
                    HO.StartDate,
                    HO.EndDate
                FROM [Attendance].[tblMHoliday](nolock) AS HO
                INNER JOIN [Attendance].[tblRHolidayGroup](nolock) RHG ON RHG.HolidayID = HO.ID
                INNER JOIN [Attendance].[tblMHolidayGroup](nolock) HG ON HG.ID = RHG.GroupID
                INNER JOIN [Attendance].[tblMEmployeeShift](nolock) ES ON ES.HolidayGroupID = HG.ID
                WHERE ES.EmployeeID = @EmployeeID
                AND CAST(HO.StartDate AS DATE) >= CAST(@TodayDate AS DATE)
                ORDER BY HO.StartDate
            `);

        // Format dates to ISO string (date only) for better handling in frontend
        const holidays = result.recordset.map(holiday => ({
            id: holiday.ID,
            name: holiday.Name,
            startDate: holiday.StartDate.toISOString().split('T')[0], // Just the date part
            endDate: holiday.EndDate.toISOString().split('T')[0]      // Just the date part
        }));

        res.status(200).send({
            message: "Upcoming holidays retrieved successfully",
            data: holidays
        });
    } catch (error) {
        console.error("Error fetching upcoming holidays:", error);
        res.status(500).send({
            message: "An error occurred while fetching upcoming holidays",
            error: error.message
        });
        next(error);
    }
};

const occasionsContorller = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            -- Step 1: Create temporary table
            CREATE TABLE #occasion (
                id INT,
                EmployeeName NVARCHAR(100),
                PictureName NVARCHAR(255),
                occasionDate DATE,
                occasion NVARCHAR(50)
            );

            -- Step 2: Insert work anniversaries (next 10 days)
            INSERT INTO #occasion (id, EmployeeName, PictureName, occasionDate, occasion)
            SELECT 
                [id],
                [EmployeeName],
                [PictureName],
                DateOfJoin,
                'work anniversary'
            FROM [EAMS].[dbo].[tblMEmployee]
            WHERE 
                DateOfJoin IS NOT NULL
                AND DATEFROMPARTS(YEAR(GETDATE()), MONTH(DateOfJoin), DAY(DateOfJoin)) 
                    BETWEEN GETDATE() AND DATEADD(DAY, 10, GETDATE());

            -- Step 3: Insert birthdays (next 10 days)
            INSERT INTO #occasion (id, EmployeeName, PictureName, occasionDate, occasion)
            SELECT 
                [id],
                [EmployeeName],
                [PictureName],
                DateOfBirth,
                'birthday'
            FROM [EAMS].[dbo].[tblMEmployee]
            WHERE 
                DateOfBirth IS NOT NULL
                AND DATEFROMPARTS(YEAR(GETDATE()), MONTH(DateOfBirth), DAY(DateOfBirth)) 
                    BETWEEN GETDATE() AND DATEADD(DAY, 10, GETDATE());

            -- Step 4: View the results
            SELECT * FROM #occasion ORDER BY occasionDate;

            -- Step 5: Drop the temp table
            DROP TABLE #occasion;
        `);

        const formatted = result.recordset.map(row => ({
            id: row.id,
            img: row.PictureName || '/images/profile.png',
            name: row.EmployeeName,
            date: new Date(row.occasionDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short'
            }),
            occasion: row.occasion
        }));

        res.status(200).send({
            message: "Upcoming occasion retrieved successfully",
            data: formatted
        });
    } catch (error) {
        console.error("Error fetching upcoming occasion:", error);
        res.status(500).send({
            message: "An error occurred while fetching upcoming occasion",
            error: error.message
        });
        next(error);
    }
};

module.exports = {
    
    getEmployeeUpcomingHolidays,
    occasionsContorller
};