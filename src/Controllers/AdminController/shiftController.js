const { poolPromise, sql } = require("../../config/db");


//Get ALL Shift
const getAllShift = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Attendance.tblMShift order by StartTime');

        res.status(200).send({
            message: "Shift are returned",
            data: result.recordset
        })
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving shifts",
            error: error.message
        });
        next(error);
    }
}

const getShiftyId = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Code',req.params.Code)
            .query('SELECT * FROM Attendance.tblMShift WHERE Code = @Code');

        res.status(200).send({
            message: "Shift is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the Shift",
            error: error.message
        });
        next(error);
    }
};


//create a Shift 
const createShift = async (req, res, next) => {
    try {
        let { Code, Name, StartTime, EndTime, LateAfter, LateCalculatedFrom, EarlyExitBefore, MinimumTimeForFullDay, MinimumTimeForHalfDay } = req.body;

        if (!Code || !Name || !StartTime || !EndTime) {
            return res.status(400).send({
                message: "Code, Name, StartTime, and EndTime are required"
            });
        }
 // Convert empty values to NULL
 LateAfter = LateAfter === '' ? null : LateAfter;
 LateCalculatedFrom = LateCalculatedFrom === '' ? null : LateCalculatedFrom;
 EarlyExitBefore = EarlyExitBefore === '' ? null : EarlyExitBefore;
 MinimumTimeForFullDay = MinimumTimeForFullDay === '' ? null : MinimumTimeForFullDay;
 MinimumTimeForHalfDay = MinimumTimeForHalfDay === '' ? null : MinimumTimeForHalfDay;


        const pool = await poolPromise;

        const checkCode = await pool.request()
            .input('Code', sql.VarChar(10), Code)
            .query('SELECT * FROM Attendance.tblMShift WHERE Code = @Code');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `Shift with Code '${Code}' already exists`
            });
        }

        await pool.request()
            .input('Code', Code)
            .input('Name', Name)
            .input('StartTime', StartTime)
            .input('EndTime', EndTime)
            .input('LateAfter', LateAfter)
            .input('LateCalculatedFrom', LateCalculatedFrom)
            .input('EarlyExitBefore', EarlyExitBefore)
            .input('MinimumTimeForFullDay', MinimumTimeForFullDay)
            .input('MinimumTimeForHalfDay', MinimumTimeForHalfDay)
            .query(`INSERT INTO Attendance.tblMShift 
                    (Code, Name, StartTime, EndTime, LateAfter, LateCalculatedFrom, EarlyExitBefore, MinimumTimeForFullDay, MinimumTimeForHalfDay) 
                    VALUES 
                    (@Code, @Name, @StartTime, @EndTime, @LateAfter, @LateCalculatedFrom, @EarlyExitBefore, @MinimumTimeForFullDay, @MinimumTimeForHalfDay)`);

        res.status(201).send({
            message: "Shift created successfully",
            data: {
                Code,
                Name,
                StartTime,
                EndTime,
                LateAfter,
                LateCalculatedFrom,
                EarlyExitBefore,
                MinimumTimeForFullDay,
                MinimumTimeForHalfDay
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the shift",
            error: error.message
        });
        next(error);
    }
};





// update a shift

const updateShift = async (req, res, next) => {
    try {
        const { Name, StartTime, EndTime, LateAfter, LateCalculatedFrom, EarlyExitBefore, MinimumTimeForFullDay, MinimumTimeForHalfDay } = req.body;
 const {Code}=req.params
        if (!Code || !Name || !StartTime || !EndTime) {
            return res.status(400).send({
                message: "Code, Name, StartTime, and EndTime are required"
            });
        }

        const pool = await poolPromise;

        // Check if the shift with the given Code exists
        const checkCode = await pool.request()
            .input('Code', sql.VarChar(10), Code)
            .query('SELECT * FROM Attendance.tblMShift WHERE Code = @Code');

        if (checkCode.recordset.length === 0) {
            return res.status(404).send({
                message: `Shift with Code '${Code}' not found`
            });
        }

        // Update the shift details in the database
        await pool.request()
            .input('Code', Code)
            .input('Name', Name)
            .input('StartTime', StartTime)
            .input('EndTime', EndTime)
            .input('LateAfter', LateAfter)
            .input('LateCalculatedFrom', LateCalculatedFrom)
            .input('EarlyExitBefore', EarlyExitBefore)
            .input('MinimumTimeForFullDay', MinimumTimeForFullDay)
            .input('MinimumTimeForHalfDay', MinimumTimeForHalfDay)
            .query(`UPDATE Attendance.tblMShift 
                    SET Name = @Name, 
                        StartTime = @StartTime, 
                        EndTime = @EndTime, 
                        LateAfter = @LateAfter, 
                        LateCalculatedFrom = @LateCalculatedFrom, 
                        EarlyExitBefore = @EarlyExitBefore, 
                        MinimumTimeForFullDay = @MinimumTimeForFullDay, 
                        MinimumTimeForHalfDay = @MinimumTimeForHalfDay 
                    WHERE Code = @Code`);

        res.status(200).send({
            message: "Shift updated successfully",
            data: {
                Code,
                Name,
                StartTime,
                EndTime,
                LateAfter,
                LateCalculatedFrom,
                EarlyExitBefore,
                MinimumTimeForFullDay,
                MinimumTimeForHalfDay
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the shift",
            error: error.message
        });
        next(error);
    }
};


//delete shift 

const deleteShift = async (req, res, next) => {
    try {
        const { shiftCode } = req.params;

        if (!shiftCode) {
            return res.status(400).send({
                message: "Code is required to delete a shift"
            });
        }

        const pool = await poolPromise;

        // Check if the shift with the given Code exists
        const checkCode = await pool.request()
            .input('shiftCode', sql.VarChar(10), shiftCode)
            .query('SELECT * FROM Attendance.tblMShift WHERE Code = @shiftCode');

        if (checkCode.recordset.length === 0) {
            return res.status(404).send({
                message: `Shift with Code '${shiftCode}' not found`
            });
        }

        // Delete the shift from the database
        await pool.request()
            .input('shiftCode', shiftCode)
            .query('DELETE FROM Attendance.tblMShift WHERE Code = @shiftCode');

        res.status(200).send({
            message: `Shift with Code '${shiftCode}' deleted successfully`
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the shift",
            error: error.message
        });
        next(error);
    }
};



// update a AutoshiftGroup

const getAllAutoShiftGroup = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
    AG.ID AS AutoShiftGroupID,
    AG.AutoShiftGroup AS AutoShiftGroupName,
    S.Code AS ShiftCode,
    CONVERT(VARCHAR(8), S.StartTime, 108) AS StartTime, -- 24-hour format HH:mm
    CONVERT(VARCHAR(8),S.EndTime, 108) AS EndTime,
    CONVERT(VARCHAR(8),SS.EntryThreshold, 108) AS EntryThreshold,
    CONVERT(VARCHAR(8),SS.EndThreshold, 108) AS EndThreshold
FROM [EAMS].[Attendance].[tblMAutoShiftGroup] AG
LEFT JOIN [Attendance].[tblMSelectedShift] SS ON AG.ID = SS.AutoShiftID
LEFT JOIN [Attendance].[tblMShift] S ON S.Code = SS.Shift;
            `);

        const autoShiftData = result.recordset;

        // Transform data into desired JSON format
        const autoShiftGroups = autoShiftData.reduce((acc, row) => {
            const existingGroup = acc.find(g => g.id === row.AutoShiftGroupID);
            const shift = row.ShiftCode ? {
                shiftCode: row.ShiftCode,
                startTime: row.StartTime,
                endTime: row.EndTime,
                entryThreshold: row.EntryThreshold,
                endThreshold: row.EndThreshold
            } : null;

            if (existingGroup) {
                if (shift) {
                    existingGroup.shifts.push(shift);
                }
            } else {
                acc.push({
                    id: row.AutoShiftGroupID,
                    name: row.AutoShiftGroupName,
                    shifts: shift ? [shift] : []
                });
            }
            return acc;
        }, []);

        res.status(200).send({
            message: "Auto shift groups with shifts returned successfully",
            data: autoShiftGroups
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving auto shift groups",
            error: error.message
        });
        next(error);
    }
};



//create a auto Shift  group
const createAutoShiftGroup = async (req, res, next) => {
    try {
        let { AutoShiftGroup } = req.body;

        if (!AutoShiftGroup ) {
            return res.status(400).send({
                message: " AutoShiftGroup is required"
            });
        }


        const pool = await poolPromise;

        const checkCode = await pool.request()
            .input('AutoShiftGroup', AutoShiftGroup)
            .query('SELECT * FROM Attendance.tblMAutoShiftGroup WHERE AutoShiftGroup = @AutoShiftGroup');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `AutoShiftGroup with Name '${AutoShiftGroup}' already exists`
            });
        }

        await pool.request()
          
            .input('AutoShiftGroup', AutoShiftGroup)
           
            .query(`INSERT INTO Attendance.tblMAutoShiftGroup 
                    (AutoShiftGroup) 
                    VALUES 
                    ( @AutoShiftGroup)`);

        res.status(201).send({
            message: "AutoShiftGroup created successfully",
            data: {
             
                AutoShiftGroup,
               
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the Auto Shift Group",
            error: error.message
        });
        next(error);
    }
};


const deleteAutoShiftGroup = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Check if the AutoShiftGroup exists
        const checkGroup = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Attendance.tblMAutoShiftGroup WHERE id = @id');

        if (checkGroup.recordset.length === 0) {
            return res.status(404).json({
                message: `AutoShiftGroup with ID '${id}' not found`
            });
        }

        // Check if any shifts are assigned to the group
        const checkShifts = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Attendance.tblMSelectedShift WHERE AutoShiftID = @id');

        if (checkShifts.recordset.length > 0) {
            return res.status(400).json({ 
                message: "Cannot delete: Shifts are assigned to this AutoShiftGroup." 
            });
        }

        // Check if any employees are assigned to the group
        const checkEmployees = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT * FROM Attendance.tblMEmployeeShift 
                WHERE NonShiftGroup = (SELECT AutoShiftGroup FROM Attendance.tblMAutoShiftGroup WHERE id = @id)
            `);

        if (checkEmployees.recordset.length > 0) {
            return res.status(400).json({ 
                message: "Cannot delete: Employees are assigned to this AutoShiftGroup." 
            });
        }

        // Start transaction for safe deletion
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Attendance.tblMAutoShiftGroup WHERE id = @id');

            await transaction.commit();
            res.status(200).json({ message: "AutoShiftGroup deleted successfully" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        res.status(500).json({
            message: "An error occurred while deleting the AutoShiftGroup",
            error: error.message
        });
        next(error);
    }
};




const getShiftForAssigment = async (req, res, next) => {
    try {
        const { id} = req.params;
        const pool = await poolPromise;
      
        const result = await pool.request()
        .input('id', id)
        .query(`
            SELECT  [Code]
      ,[Name]
      ,CONVERT(VARCHAR(8), StartTime, 108) AS StartTime
      ,CONVERT(VARCHAR(8),EndTime, 108) AS EndTime
      ,[LateAfter]
      ,[LateCalculatedFrom]
      ,[EarlyExitBefore]
      ,[IfHalfDayShift]
      ,[MinimumTimeForFullDay]
      ,[MinimumTimeForHalfDay]
  FROM [EAMS].[Attendance].[tblMShift]
            where Code not in (select Shift from [Attendance].[tblMSelectedShift] where AutoShiftID=@id)
            `);

        res.status(200).send({
            message: "Shift list returned",
            data: result.recordset
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving Shift",
            error: error.message
        });
        next(error);
    }
};


const assignAutoShiftSchema = async (req, res, next) => {
    try {
        const { AutoShiftGroupID, ShiftCode, EntryThreshold,EndThreshold } = req.body; // Assuming these fields are passed in the request body

        const pool = await poolPromise;

        // Insert the holiday into the holiday group
        await pool.request()
            .input('AutoShiftGroupID', sql.Int,AutoShiftGroupID)
            .input('ShiftCode',  ShiftCode)
            .input('EntryThreshold', EntryThreshold)
            .input('EndThreshold', EndThreshold)

            .query(`
                INSERT INTO Attendance.tblMSelectedShift (AutoShiftID, Shift, EntryThreshold, EndThreshold)
                VALUES (@AutoShiftGroupID, @ShiftCode, @EntryThreshold, @EndThreshold)
            `);

        res.status(201).send({
            message: "Shift successfully assigned to the AutoShhiftgroup",
            data: { AutoShiftGroupID, ShiftCode, EntryThreshold,EndThreshold }
        });
        
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while assigning the Shift to the AutoShhiftgroup",
            error: error.message
        });
        next(error);
    }
};

const unAssignAutoShiftSchema = async (req, res, next) => {
    try {
        const { AutoShiftGroupID, shiftCode, } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('AutoShiftGroupID', sql.Int, AutoShiftGroupID)
            .input('ShiftCode', shiftCode)
            .query(`
                DELETE FROM Attendance.tblMSelectedShift
                WHERE AutoShiftID = @AutoShiftGroupID and Shift=@shiftCode 
            `);

        res.status(200).send({
            message: "Shift is successfully unassigned from the AutoShifgroup",
            data: { shiftCode,AutoShiftGroupID }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while unassigning the Shift from the AutoShifgroup",
            error: error.message
        });
        next(error);
    }
};






module.exports = {
    getAllShift,
    getShiftyId,
    createShift,
    updateShift,
    deleteShift,
    getAllAutoShiftGroup,
    createAutoShiftGroup,
    deleteAutoShiftGroup,
    assignAutoShiftSchema,
    getShiftForAssigment,
    unAssignAutoShiftSchema
};