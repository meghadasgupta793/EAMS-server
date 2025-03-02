const { poolPromise, sql } = require("../../config/db");

// GET ALL HOLIDAYS
const getAllHolidaysList = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Attendance.tblMHoliday');

        res.status(200).send({
            message: "Holidays list returned",
            data: result.recordset
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving holidays",
            error: error.message
        });
        next(error);
    }
};
const getHolidayById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM Attendance.tblMHoliday WHERE Id = @Id');

        res.status(200).send({
            message: "Holiday is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the Holiday",
            error: error.message
        });
        next(error);
    }
};

// CREATE HOLIDAY
const createHolidayList = async (req, res, next) => {
    try {
        const { Name, StartDate, EndDate } = req.body;

        // Validate input
        if (!Name) {
            return res.status(400).send({
                message: "Name is required"
            });
        }

        const pool = await poolPromise;

        // Check if the Name already exists
        const checkName = await pool.request()
            .input('Name', Name)
            .query('SELECT * FROM Attendance.tblMHoliday WHERE Name = @Name');

        if (checkName.recordset.length > 0) {
            return res.status(400).send({
                message: `Holiday with Name '${Name}' already exists`
            });
        }

        // Insert if the code doesn't exist
        await pool.request()
            .input('Name', Name)
            .input('StartDate', StartDate)
            .input('EndDate', EndDate)
            .query(`
                INSERT INTO Attendance.tblMHoliday (Name, StartDate, EndDate)
                VALUES (@Name, @StartDate, @EndDate);
            `);

        res.status(201).send({
            message: "Holiday created successfully",
            data: { Name, StartDate, EndDate }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the holiday",
            error: error.message
        });
        next(error);
    }
};

// UPDATE HOLIDAY
const updateHolidayList = async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming the holiday ID is passed as a route parameter
        const { Name, StartDate, EndDate } = req.body;

        const pool = await poolPromise;

        // Check if the holiday exists
        const checkHoliday = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblMHoliday WHERE id = @id');

        if (checkHoliday.recordset.length === 0) {
            return res.status(404).send({
                message: `Holiday with ID '${id}' not found`
            });
        }

        // Update the holiday
        await pool.request()
            .input('id', id)
            .input('Name', Name)
            .input('StartDate', StartDate)
            .input('EndDate', EndDate)
            .query(`
                UPDATE Attendance.tblMHoliday
                SET Name = @Name, StartDate = @StartDate, EndDate = @EndDate
                WHERE id = @id;
            `);

        res.status(200).send({
            message: "Holiday updated successfully",
            data: { id, Name, StartDate, EndDate }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the holiday",
            error: error.message
        });
        next(error);
    }
};

// DELETE HOLIDAY
const deleteHolidayList = async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming the holiday ID is passed as a route parameter

        const pool = await poolPromise;

        // Check if the holiday exists
        const checkHoliday = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblMHoliday WHERE id = @id');

        if (checkHoliday.recordset.length === 0) {
            return res.status(404).send({
                message: `Holiday with ID '${id}' not found`
            });
        }

        // Delete the holiday
        await pool.request()
            .input('id', id)
            .query(`
                DELETE FROM Attendance.tblMHoliday WHERE id = @id;
            `);

        res.status(200).send({
            message: "Holiday deleted successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the holiday",
            error: error.message
        });
        next(error);
    }
};


const getHolidayForAssing = async (req, res, next) => {
    try {
        const { id} = req.params;
        const pool = await poolPromise;
      
        const result = await pool.request()
        .input('id', id)
        .query(`
            select * from [Attendance].[tblMHoliday] 
            where id not in (select HolidayID from Attendance.tblRHolidayGroup where GroupID=@id)
            `);

        res.status(200).send({
            message: "Holidays list returned",
            data: result.recordset
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving holidays",
            error: error.message
        });
        next(error);
    }
};






const getAllHolidayGroup = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .query(`SELECT 
            HG.ID AS HolidayGroupID,
            HG.GroupName AS HolidayGroupName,
            H.ID AS HolidayID,
            H.Name AS HolidayName,
            FORMAT(H.StartDate, 'dd-MM-yyyy') AS FromDate,
            FORMAT(H.EndDate, 'dd-MM-yyyy') AS ToDate
        FROM Attendance.tblMHolidayGroup HG
        LEFT JOIN Attendance.tblRHolidayGroup HGH ON HG.ID = HGH.GroupID
        LEFT JOIN Attendance.tblMHoliday H ON HGH.HolidayID = H.ID
        WHERE HG.DeletedOn IS NULL`);

        const holidaysData = result.recordset;

        // Transform data into desired JSON format
        const holidayGroups = holidaysData.reduce((acc, row) => {
            const existingGroup = acc.find(g => g.id === row.HolidayGroupID);
            const holiday = row.HolidayName ? {
                id: row.HolidayID,
                name: row.HolidayName,
                fromDate: row.FromDate,
                toDate: row.ToDate
            } : null;

            if (existingGroup) {
                if (holiday) {
                    existingGroup.holidays.push(holiday);
                }
            } else {
                acc.push({
                    id: row.HolidayGroupID,
                    name: row.HolidayGroupName,
                    holidays: holiday ? [holiday] : []
                });
            }
            return acc;
        }, []);

        res.status(200).send({
            message: "Holiday groups with holidays returned successfully",
            data: holidayGroups
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving holiday groups",
            error: error.message
        });
        next(error);
    }
};



// CREATE HOLIDAYGroup
const createHolidayGroup = async (req, res, next) => {
    try {
        const { Name, } = req.body;

        // Validate input
        if (!Name) {
            return res.status(400).send({
                message: "Name is required"
            });
        }

        const pool = await poolPromise;

        // Check if the Name already exists
        const checkName = await pool.request()
            .input('Name', Name)
            .query('SELECT * FROM Attendance.tblMHolidayGroup WHERE GroupName = @Name');

        if (checkName.recordset.length > 0) {
            return res.status(400).send({
                message: `HolidayGroup with Name '${Name}' already exists`
            });
        }

        // Insert if the code doesn't exist
        await pool.request()
            .input('Name', Name)
            .query(`
                INSERT INTO Attendance.tblMHolidayGroup (GroupName,CreatedOn,CreatedBy)
                VALUES (@Name, getdate(), '1');
            `);

        res.status(201).send({
            message: "HolidayGroup created successfully",
            data: { Name }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the holidayGroup",
            error: error.message
        });
        next(error);
    }
};

// UPDATE HOLIDAYGroup
const updateHolidayGroup = async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming the holidayGroup ID is passed as a route parameter
        const { Name } = req.body;

        const pool = await poolPromise;

        // Check if the holidayGroup exists
        const checkHoliday = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblMHolidayGroup WHERE id = @id');

        if (checkHoliday.recordset.length === 0) {
            return res.status(404).send({
                message: `HolidayGroup with ID '${id}' not found`
            });
        }

        // Update the holidayGroup
        await pool.request()
            .input('id', id)
            .input('Name', Name)

            .query(`
                UPDATE Attendance.tblMHolidayGroup
                SET GroupName = @Name
                WHERE id = @id;
            `);

        res.status(200).send({
            message: "HolidayGroup updated successfully",
            data: { id, Name }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the holidayGroup",
            error: error.message
        });
        next(error);
    }
};

// DELETE HOLIDAY
const deleteHolidayGroup = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Check if the holiday group exists
        const checkHoliday = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblMHolidayGroup WHERE id = @id');

        if (checkHoliday.recordset.length === 0) {
            return res.status(404).send({
                message: `HolidayGroup with ID '${id}' not found`
            });
        }

        // Check if any holidays are assigned to the group
        const checkHolidayList = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblRHolidayGroup WHERE GroupID = @id');

        if (checkHolidayList.recordset.length > 0) {
            return res.status(400).send({ 
                message: "Cannot delete: Holidays are assigned to this group." 
            });
        }

        // Check if any employees are assigned to the group
        const checkEmployee = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Attendance.tblMEmployeeShift WHERE HolidayGroupID = @id');

        if (checkEmployee.recordset.length > 0) {
            return res.status(400).send({ 
                message: "Cannot delete: Employees are assigned to this group." 
            });
        }

        // Start transaction for safe deletion
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            await transaction.request()
                .input('id', id)
                .query('DELETE FROM Attendance.tblMHolidayGroup WHERE id = @id');

            await transaction.commit(); // Commit changes
            res.status(200).send({ message: "HolidayGroup deleted successfully" });
        } catch (err) {
            await transaction.rollback(); // Rollback if error occurs
            throw err; // Re-throw to catch in the outer try-catch
        }

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the HolidayGroup",
            error: error.message
        });
        next(error);
    }
};



const getHolidayByGroupId = async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming the holidayGroup ID is passed as a route parameter

        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id) // Specify SQL type for 'id'
            .query(`
               SELECT  [id] as HolidayID,
                       Name AS HolidayName,
                       FORMAT(StartDate, 'dd-MM-yyyy') AS StartDate,
                       FORMAT(EndDate, 'dd-MM-yyyy') AS EndDate
                FROM [Attendance].tblMHoliday 
                WHERE id not in ( select HolidayID FROM [Attendance].[tblRHolidayGroup]  WHERE GroupID = @id)
            `);

        res.status(200).send({
            message: "Holiday list fetched successfully",
            data: result.recordset // Send the query result
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching the holiday list in the group",
            error: error.message
        });
        next(error);
    }
};



const assignHolidayInAHolidayGroup = async (req, res, next) => {
    try {
        const { GroupID, HolidayID, CreatedBy } = req.body; // Assuming these fields are passed in the request body

        const pool = await poolPromise;

        // Insert the holiday into the holiday group
        await pool.request()
            .input('GroupID', sql.Int, GroupID)
            .input('HolidayID', sql.Int, HolidayID)
            .input('CreatedBy', sql.Int, CreatedBy)
            .query(`
                INSERT INTO Attendance.tblRHolidayGroup (GroupID, HolidayID, CreatedOn, CreatedBy)
                VALUES (@GroupID, @HolidayID, GETDATE(), @CreatedBy)
            `);

        res.status(201).send({
            message: "Holiday successfully assigned to the group",
            data: { GroupID, HolidayID, CreatedBy }
        });
        
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while assigning the holiday to the group",
            error: error.message
        });
        next(error);
    }
};



const unAssignHolidayFromAHolidayGroup = async (req, res, next) => {
    try {
        const { GroupID, HolidayID, CreatedBy } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('GroupID', sql.Int, GroupID)
            .input('HolidayID', sql.Int, HolidayID)
            .query(`
                DELETE FROM Attendance.tblRHolidayGroup
                WHERE GroupID = @GroupID and HolidayID=@HolidayID 
            `);

        res.status(200).send({
            message: "Holiday successfully unassigned from the group",
            data: { GroupID }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while unassigning the holiday from the group",
            error: error.message
        });
        next(error);
    }
};







module.exports = {
    getAllHolidaysList,
    getHolidayById,
    createHolidayList,
    updateHolidayList,
    deleteHolidayList,
    getHolidayForAssing,
    getAllHolidayGroup,
    createHolidayGroup,
    updateHolidayGroup,
    deleteHolidayGroup,
    getHolidayByGroupId,
    assignHolidayInAHolidayGroup,
    unAssignHolidayFromAHolidayGroup
};
