const { poolPromise, sql } = require("../../config/db");
const fs = require('fs');
const path = require('path');

const uploadFolderPath = path.resolve(__dirname, '../../../public/images/Employee');


// Function to create a new employee
const createEmployees = async (req, res, next) => {
    const {
        EmployeeName, EmpNo, IdNo, PhoneNo, Email, Address, 
        PFNumber, ESINumber, ValidUpTo,DateOfJoin, CreatedBy, AadhaarNo, 
        PictureName, ShiftType, Shift, Weekoffs, AltHoliday, 
        NonShiftGroup, LateApplicable, ShiftEarlyAsExtra, 
        SinglePunchAllowed, HolidayGroupID, CalculateWorkHour, 
        OverTimeApplicable, DepartmentID, OUID ,DesignationID,BatchID,CategoryID
    } = req.body;

    // Validation
    if (!EmpNo || !EmployeeName) {
        return res.status(400).json({
            message: 'EmpNo and EmployeeName are required'
        });
    }

    const pool = await poolPromise
     // Check if the Code already exists
     const checkEmpNo = await pool.request()
     .input('EmpNo', EmpNo)
     .query('SELECT * FROM tblMEmployee WHERE EmpNo = @EmpNo');

 if (checkEmpNo.recordset.length > 0) {
     return res.status(400).send({
         message: `Employee with EmpNo '${EmpNo}' already exists`
     });
 }



    try {
        let base64Pic = null;

        // Handle Profile Picture conversion if available
        if (PictureName) {
            const filePath = path.join(uploadFolderPath, PictureName);
            const fileBuffer = fs.readFileSync(filePath);
            base64Pic = fileBuffer.toString('base64');
        }

        // Save employee to the database using the stored procedure
        const employeeId = await saveEmployeeToDatabase({
            EmployeeName, EmpNo, IdNo, PhoneNo, Email, Address, 
            PFNumber, ESINumber, ValidUpTo,DateOfJoin, CreatedBy, AadhaarNo,
            base64Pic, PictureName, ShiftType, Shift, Weekoffs, 
            AltHoliday, NonShiftGroup, LateApplicable, ShiftEarlyAsExtra, 
            SinglePunchAllowed, HolidayGroupID, CalculateWorkHour, 
            OverTimeApplicable, DepartmentID, OUID,DesignationID,BatchID,CategoryID
        });

        res.status(201).send({
            message: "Employee Created successfully",
            data: {
               
                EmployeeName,
                EmpNo,
                PhoneNo,
                Email,
                Address,
                PictureName // Base64 picture if available
            }
        });
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).send({
            message: "An error occurred while creating the Employee",
            error: error.message
        });
        next(error);
    }
};


const saveEmployeeToDatabase = async (employeeData) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters to match the stored procedure
        request.input('EmployeeName', sql.NVarChar, employeeData.EmployeeName);
        request.input('EmpNo', sql.VarChar, employeeData.EmpNo);
        request.input('IdNo', sql.BigInt, employeeData.IdNo);
        request.input('PhoneNo', sql.VarChar, employeeData.PhoneNo);
        request.input('Email', sql.VarChar, employeeData.Email);
        request.input('Address', sql.NVarChar, employeeData.Address);
        request.input('PFNumber', sql.VarChar, employeeData.PFNumber);
        request.input('ESINumber', sql.VarChar, employeeData.ESINumber);
        request.input('ValidUpTo', sql.Date, employeeData.ValidUpTo);
        request.input('DateOfJoin', sql.Date, employeeData.DateOfJoin);
        request.input('CreatedBy', sql.BigInt, employeeData.CreatedBy);
        request.input('AadhaarNo', sql.VarChar, employeeData.AadhaarNo);
        request.input('PictureName', sql.NVarChar, employeeData.PictureName);
        request.input('Base64Pic', sql.NVarChar(sql.MAX), employeeData.base64Pic); // Picture as base64
        request.input('ShiftType', sql.Int, employeeData.ShiftType);
        request.input('Shift', sql.VarChar, employeeData.Shift);
        request.input('AltShiftWO', sql.VarChar, employeeData.Weekoffs);
        request.input('AltHoliday', sql.VarChar, employeeData.AltHoliday);
        request.input('NonShiftGroup', sql.VarChar, employeeData.NonShiftGroup);
        request.input('LateApplicable', sql.Bit, employeeData.LateApplicable);
        request.input('ShiftEarlyAsExtra', sql.Bit, employeeData.ShiftEarlyAsExtra);
        request.input('SinglePunchAllowed', sql.Bit, employeeData.SinglePunchAllowed);
        request.input('HolidayGroupID', sql.Int, employeeData.HolidayGroupID);
        request.input('CalculateWorkHour', sql.Int, employeeData.CalculateWorkHour);
        request.input('OverTimeApplicable', sql.Bit, employeeData.OverTimeApplicable);
        request.input('DepartmentID', sql.Int, employeeData.DepartmentID);
        request.input('OUID', sql.Int, employeeData.OUID);
        request.input('DesignationID',sql.Int, employeeData.DesignationID)
        request.input('BatchID',sql.Int, employeeData.BatchID)
        request.input('CategoryID',sql.Int, employeeData.CategoryID)

        // Execute the stored procedure
        const result = await request.execute('spMEmployeeCreate');

        console.log("Stored Procedure Result:", result); // 🔍 Debugging output

        // ✅ Ensure recordset exists and contains EmployeeID
        if (!result.recordset || result.recordset.length === 0 || !result.recordset[0].EmployeeID) {
            throw new Error("No EmployeeID returned from the database.");
        }

        return result.recordset[0].EmployeeID;
    } catch (dbError) {
        console.error("Error saving employee to database:", dbError);
        throw dbError;
    }
};

// Function to Update a employee
const updateEmployee = async (req, res, next) => {
    const { id } = req.params;
    const {
        EmployeeName, EmpNo, IdNo, PhoneNo, Email, Address, 
        PFNumber, ESINumber, ValidUpTo,DateOfJoin, CreatedBy, AadhaarNo, 
        PictureName, ShiftType, Shift, Weekoffs, AltHoliday, 
        NonShiftGroup, LateApplicable, ShiftEarlyAsExtra, 
        SinglePunchAllowed, HolidayGroupID, CalculateWorkHour, 
        OverTimeApplicable, DepartmentID, OUID, DesignationID, BatchID, CategoryID
    } = req.body;

    // Validation
    if (!id || !EmpNo || !EmployeeName) {
        return res.status(400).json({
            message: 'ID, EmpNo, and EmployeeName are required'
        });
    }

    try {
        let base64Pic = null;

        // Handle Profile Picture conversion if available
        if (PictureName) {
            const filePath = path.join(uploadFolderPath, PictureName);
            const fileBuffer = fs.readFileSync(filePath);
            base64Pic = fileBuffer.toString('base64');
        }

        // Update employee in the database
        await updateEmployeeInDatabase({
            id, EmployeeName, EmpNo, IdNo, PhoneNo, Email, Address, 
            PFNumber, ESINumber, ValidUpTo,DateOfJoin, CreatedBy, AadhaarNo,
            base64Pic, PictureName, ShiftType, Shift, Weekoffs, 
            AltHoliday, NonShiftGroup, LateApplicable, ShiftEarlyAsExtra, 
            SinglePunchAllowed, HolidayGroupID, CalculateWorkHour, 
            OverTimeApplicable, DepartmentID, OUID, DesignationID, BatchID, CategoryID
        });

        res.status(200).send({
            message: "Employee updated successfully"
        });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).send({
            message: "An error occurred while updating the Employee",
            error: error.message
        });
        next(error);
    }
};

const updateEmployeeInDatabase = async (employeeData) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('id', sql.Int, employeeData.id);
        request.input('EmployeeName', sql.NVarChar, employeeData.EmployeeName);
        request.input('EmpNo', sql.VarChar, employeeData.EmpNo);
        request.input('IdNo', sql.BigInt, employeeData.IdNo);
        request.input('PhoneNo', sql.VarChar, employeeData.PhoneNo);
        request.input('Email', sql.VarChar, employeeData.Email);
        request.input('Address', sql.NVarChar, employeeData.Address);
        request.input('PFNumber', sql.VarChar, employeeData.PFNumber);
        request.input('ESINumber', sql.VarChar, employeeData.ESINumber);
        request.input('ValidUpTo', sql.Date, employeeData.ValidUpTo);
        request.input('DateOfJoin', sql.Date, employeeData.DateOfJoin);
        request.input('CreatedBy', sql.BigInt, employeeData.CreatedBy);
        request.input('AadhaarNo', sql.VarChar, employeeData.AadhaarNo);
        request.input('PictureName', sql.NVarChar, employeeData.PictureName);
        request.input('Base64Pic', sql.NVarChar(sql.MAX), employeeData.base64Pic);
        request.input('ShiftType', sql.Int, employeeData.ShiftType);
        request.input('Shift', sql.VarChar, employeeData.Shift);
        request.input('AltShiftWO', sql.VarChar, employeeData.Weekoffs);
        request.input('AltHoliday', sql.VarChar, employeeData.AltHoliday);
        request.input('NonShiftGroup', sql.VarChar, employeeData.NonShiftGroup);
        request.input('LateApplicable', sql.Bit, employeeData.LateApplicable);
        request.input('ShiftEarlyAsExtra', sql.Bit, employeeData.ShiftEarlyAsExtra);
        request.input('SinglePunchAllowed', sql.Bit, employeeData.SinglePunchAllowed);
        request.input('HolidayGroupID', sql.Int, employeeData.HolidayGroupID);
        request.input('CalculateWorkHour', sql.Int, employeeData.CalculateWorkHour);
        request.input('OverTimeApplicable', sql.Bit, employeeData.OverTimeApplicable);
        request.input('DepartmentID', sql.Int, employeeData.DepartmentID);
        request.input('OUID', sql.Int, employeeData.OUID);
        request.input('DesignationID', sql.Int, employeeData.DesignationID);
        request.input('BatchID', sql.Int, employeeData.BatchID);
        request.input('CategoryID', sql.Int, employeeData.CategoryID);

        // Execute the stored procedure
        await request.execute('spMEmployeeUpdate');
    } catch (dbError) {
        console.error("Error updating employee in database:", dbError);
        throw dbError;
    }
};


//GET ALL DEPARTMENTS 
const getAllEmployee = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
       
        .query(`
            SELECT 
                E.[id],
                E.[EmployeeName],
                E.[EmpNo],
                E.[IdNo],
                E.[PhoneNo],
                E.[Email],
                E.[Address],
                E.[CreatedOn],
                E.[PictureName],
                E.[PFNumber],
                E.[ESINumber],
                E.[AadhaarNo],
                E.[ValidUpTo],
                
                -- Organizational Unit Details
                OU.ID AS OUID,
                OU.OUCode,
                OU.OUName,

                -- Department Details
                Dept.ID AS DepartmentID,
                Dept.Code AS DepartmentCode,
                Dept.Name AS DepartmentName,

                -- Designation Details
                Deg.ID AS DesignationID,
                Deg.Code AS DesignationCode,
                Deg.Name AS DesignationName,

                -- Category Details
                Cat.ID AS CategoryID,
                Cat.Code AS CategoryCode,
                Cat.Name AS CategoryName,

                -- Batch Details
                Bat.ID AS BatchID,
                Bat.Code AS BatchCode,
                Bat.Name AS BatchName

            FROM [dbo].[tblMEmployee](nolock) E
            INNER JOIN dbo.OUEmployee() OE ON E.id = OE.EmployeeID
            INNER JOIN tblMOU(nolock) OU ON OU.ID = OE.OUID

            INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
            INNER JOIN tblMDepartment(nolock) Dept ON Dept.ID = DeptEmp.DepartmentID

            INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
            INNER JOIN tblMDesignation(nolock) Deg ON Deg.ID = DegEmp.DesignationID

            INNER JOIN dbo.CategoryEmployee() CatEmp ON E.id = CatEmp.EmployeeID
            INNER JOIN tblMCategory(nolock) Cat ON Cat.ID = CatEmp.CategoryID

            INNER JOIN dbo.BatchEmployee() BatEmp ON E.id = BatEmp.EmployeeID
            INNER JOIN tblMBatch(nolock) Bat ON Bat.ID = BatEmp.BatchID;
        `);

        if (result.recordset.length === 0) {
            return res.status(404).send({
                message: "No employees found",
                data: []
            });
        }

        res.status(200).send({
            message: "Employees retrieved successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).send({
            message: "An error occurred while retrieving employees",
            error: error.message
        });
        next(error);
    }
};

//GET Employee BY ID

const getEmployeeByID = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "Invalid Employee ID" });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                Select  E.id as EmployeeID, EmployeeName, EmpNo, IdNo, PhoneNo, Email, Address, 
            PFNumber, ESINumber, ValidUpTo,DateOfJoin,  AadhaarNo,
            PictureName, ShiftType, Shift, ES.AltShiftWO as Weekoffs, 
            AltHoliday, NonShiftGroup, LateApplicable, ShiftEarlyAsExtra, 
            SinglePunchAllowed, HolidayGroupID, CalculateWorkHour, 
            OverTimeApplicable, Dept.id as DepartmentID,OU.id as  OUID, Deg.id as DesignationID,Bat.id as BatchID, Cat.id as CategoryID

FROM tblMEmployee E WITH (NOLOCK)
                INNER JOIN dbo.OUEmployee() OE ON E.id = OE.EmployeeID
                INNER JOIN tblMOU (NOLOCK) OU ON OU.ID = OE.OUID
                INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
                INNER JOIN tblMDepartment (NOLOCK) Dept ON Dept.ID = DeptEmp.DepartmentID
                INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
                INNER JOIN tblMDesignation (NOLOCK) Deg ON Deg.ID = DegEmp.DesignationID
                INNER JOIN dbo.CategoryEmployee() CatEmp ON E.id = CatEmp.EmployeeID
                INNER JOIN tblMCategory (NOLOCK) Cat ON Cat.ID = CatEmp.CategoryID
                INNER JOIN dbo.BatchEmployee() BatEmp ON E.id = BatEmp.EmployeeID
                INNER JOIN tblMBatch (NOLOCK) Bat ON Bat.ID = BatEmp.BatchID
				inner join attendance.tblMEmployeeShift (NOLOCK) ES on ES.EmployeeID=E.id
                WHERE E.id = @id
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee retrieved successfully",
            data: result.recordset[0],
        });

    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({
            message: "An error occurred while retrieving employee details",
            error: error.message,
        });
        next(error);
    }
};

const getEmployeeByEmpNoOrName = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const { SearchType, dataValue } = req.query;

        // Log the query params for debugging
        console.log("SearchType:", SearchType);
        console.log("dataValue:", dataValue);

        // Validate input
        if (!SearchType || !dataValue) {
            return res.status(400).send({
                message: "SearchType and dataValue are required"
            });
        }

        // Add wildcards to dataValue for LIKE operation
        const dataValueWithWildcards = `%${dataValue}%`;

        const result = await pool.request()
            .input('SearchType', SearchType)
            .input('dataValue', dataValueWithWildcards)
            .query(`
               SELECT E.id, E.EmployeeName, E.EmpNo, E.PhoneNo, E.Email, 
                      E.PictureName, OU.OUName, 
                      Dept.Name AS DepartmentName, Deg.Name AS DesignationName
               FROM tblMEmployee E WITH (NOLOCK)
               INNER JOIN dbo.OUEmployee() OE ON E.id = OE.EmployeeID
               INNER JOIN tblMOU OU ON OU.ID = OE.OUID
               INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
               INNER JOIN tblMDepartment Dept ON Dept.ID = DeptEmp.DepartmentID
               INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
               INNER JOIN tblMDesignation Deg ON Deg.ID = DegEmp.DesignationID
               WHERE 
                   (
                       (@SearchType = 'EmpNo' AND E.EmpNo LIKE @dataValue) 
                       OR 
                       (@SearchType = 'Name' AND E.EmployeeName LIKE @dataValue)
                   )
            `);

        // Log the result of the query for debugging
        console.log("Query result:", result.recordset);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // If there are multiple employees, send the array of results
       
            return res.status(200).json({
                message: "Employees retrieved successfully",
                data: result.recordset,
            })

   

    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({
            message: "An error occurred while retrieving employee details",
            error: error.message,
        });
        next(error);
    }
};


const getEmployeeByEmpNo = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const { empNo } = req.params;


        const result = await pool.request()
            .input('empNo',  empNo)
            .query(`
                Select  E.id as EmployeeID, EmployeeName, EmpNo,PictureName,
    FORMAT(ATT.InDateTime, 'HH:mm') AS inTime,
    FORMAT(ATT.OutDateTime, 'HH:mm') AS outTime

FROM tblMEmployee E WITH (NOLOCK)
left JOIN Attendance.tblTAttendance ATT WITH (NOLOCK) ON ATT.EmployeeID = E.ID and DATE = CONVERT(DATE, GETDATE())
 WHERE E.EmpNo = @empNo
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee retrieved successfully",
            data: result.recordset[0],
        });

    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({
            message: "An error occurred while retrieving employee details",
            error: error.message,
        });
        next(error);
    }
};

const getEmpInfoByID = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "Invalid Employee ID" });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT E.id,E.EmpNo, E.EmployeeName, E.PictureName, Deg.Name AS Designation, Dept.Name AS Department
                FROM  tblMEmployee(NOLOCK)  E 
                INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
                INNER JOIN tblMDepartment(NOLOCK)  Dept ON Dept.ID = DeptEmp.DepartmentID
                INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
                INNER JOIN tblMDesignation(NOLOCK)  Deg ON Deg.ID = DegEmp.DesignationID
                WHERE E.id = @id
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee retrieved successfully",
            data: result.recordset[0],
        });

    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({
            message: "An error occurred while retrieving employee details",
            error: error.message,
        });
        next(error);
    }
};




module.exports = {createEmployees,updateEmployee,getAllEmployee,getEmployeeByID,
    getEmployeeByEmpNoOrName,
    getEmpInfoByID,
    getEmployeeByEmpNo}

