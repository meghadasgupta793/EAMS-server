const { poolPromise, sql } = require("../../config/db");

const unAssignedReporteeList = async (req, res) => {
    try {
        const { ApproverEmployeeID, OuId, DepartmentId, DesignationID } = req.body;

        if (!ApproverEmployeeID) {
            return res.status(400).send({ message: "ApproverEmployeeID is required" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("ApproverEmployeeID", sql.Int, ApproverEmployeeID)
            .input("OuId", sql.NVarChar(sql.MAX), OuId || null)
            .input("DepartmentId", sql.NVarChar(sql.MAX), DepartmentId || null)
            .input("DesignationID", sql.NVarChar(sql.MAX), DesignationID || null)
            .execute("sp_GetUnassignedReportees");

        return res.status(200).send({
            message: "Unassigned reportee list fetched successfully",
            data: result.recordset
        });
    } catch (error) {
        console.error("SQL Error:", error);
        return res.status(500).send({
            message: "SQL Error",
            error: error.originalError || error
        });
    }
};


// approverMapping
const approverMapping = async (req, res, next) => {
    try {
        const { EmployeeIDs, ApprovalLevel, ApproverEmployeeID, LastUpdatedBy, RequestType } = req.body;
        
        // Validate required fields
        if (!EmployeeIDs || !Array.isArray(EmployeeIDs) || EmployeeIDs.length === 0) {
            return res.status(400).send({ message: "EmployeeIDs array is required" });
        }
        if (!ApproverEmployeeID) {
            return res.status(400).send({ message: "ApproverEmployeeID is required" });
        }
        if (!ApprovalLevel) {
            return res.status(400).send({ message: "ApprovalLevel is required" });
        }
        

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        try {
            await transaction.begin();
            
            // Prepare the insert query
            const insertQuery = `
                INSERT INTO ApprovalWorkFlow.tblRApprovalSetupMaster
                (EmployeeID, ApprovalLevel, ApproverEmployeeID, LastUpdatedOn, LastUpdatedBy)
                VALUES (@EmployeeID, @ApprovalLevel, @ApproverEmployeeID, GETDATE(), @LastUpdatedBy)
            `;
            
            // Process each employee ID
            for (const EmployeeID of EmployeeIDs) {
                const request = new sql.Request(transaction);
                await request
                    .input('EmployeeID', sql.Int, EmployeeID)
                    .input('ApprovalLevel', sql.VarChar(50), ApprovalLevel)
                    .input('ApproverEmployeeID', sql.Int, ApproverEmployeeID)
                    .input('LastUpdatedBy', sql.Int, LastUpdatedBy)
                    .query(insertQuery);
            }
            
            await transaction.commit();
            
            res.status(201).send({
                message: "Approver mapping created successfully",
                data: {
                    EmployeeIDs,
                    ApprovalLevel,
                    ApproverEmployeeID,
                    count: EmployeeIDs.length
                }
            });
            
        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError;
        }
        
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while mapping the approver",
            error: error.message
        });
        next(error);
    }
};

const getReportingLists = async (req, res, next) => {
    try {
        const { EmployeeID } = req.params;
        if (!EmployeeID) {
            return res.status(400).send({ message: "EmployeeID is required" });
        }

        const pool = await poolPromise;

        // Fetch reportingToList
        const reportingToResult = await pool.request()
            .input('EmployeeID', sql.Int, EmployeeID)
            .query(`
                SELECT E.EmpNo, E.EmployeeName, E.PictureName, Deg.Name AS Designation, Dept.Name AS Department,
                ASM.ApprovalLevel AS Level
                FROM [ApprovalWorkFlow].[tblRApprovalSetupMaster](NOLOCK) ASM
                INNER JOIN tblMEmployee(NOLOCK)  E ON ASM.ApproverEmployeeID = E.ID
                INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
                INNER JOIN tblMDepartment(NOLOCK)  Dept ON Dept.ID = DeptEmp.DepartmentID
                INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
                INNER JOIN tblMDesignation(NOLOCK)  Deg ON Deg.ID = DegEmp.DesignationID
                WHERE ASM.EmployeeID = @EmployeeID
            `);

        const reportingToList = reportingToResult.recordset.map(row => ({
            empPhoto: row.PictureName,
            name: row.EmployeeName,
            empNo: row.EmpNo,
            designation: row.Designation,
            department: row.Department,
            level: row.Level
        }));

        // Fetch reportingByList
        const reportingByResult = await pool.request()
            .input('EmployeeID', sql.Int, EmployeeID)
            .query(`
                SELECT E.EmpNo, E.EmployeeName, E.PictureName, Deg.Name AS Designation, Dept.Name AS Department,
                ASM.ApprovalLevel AS Level
                FROM [ApprovalWorkFlow].[tblRApprovalSetupMaster](NOLOCK) ASM
                INNER JOIN tblMEmployee(NOLOCK)  E ON ASM.EmployeeID = E.ID
                INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.id = DeptEmp.EmployeeID
                INNER JOIN tblMDepartment(NOLOCK)  Dept ON Dept.ID = DeptEmp.DepartmentID
                INNER JOIN dbo.DesignationEmployee() DegEmp ON E.id = DegEmp.EmployeeID
                INNER JOIN tblMDesignation(NOLOCK)  Deg ON Deg.ID = DegEmp.DesignationID
                WHERE ASM.ApproverEmployeeID = @EmployeeID
            `);

        const reportingByList = reportingByResult.recordset.map(row => ({
            empPhoto: row.PictureName,
            name: row.EmployeeName,
            empNo: row.EmpNo,
            designation: row.Designation,
            department: row.Department,
            level: row.Level
        }));

        res.status(200).send({ reportingToList, reportingByList });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching reporting lists",
            error: error.message
        });
        next(error);
    }
};

const myTeamToday = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query(`
                 SELECT 
                E.id,
                    E.EmpNo, 
                    E.EmployeeName, 
                    E.PictureName, 
                    Deg.Name AS Designation,
                    Dept.Name AS Department,
                    FORMAT(ATT.InDateTime, 'HH:mm') AS inTime,
                    FORMAT(ATT.OutDateTime, 'HH:mm') AS outTime,
					FORMAT(DATEADD(MINUTE, ISNULL(ATT.LateIn, 0), '00:00'), 'HH:mm') AS late,
                	FORMAT(DATEADD(MINUTE, ISNULL(ATT.EarlyOut, 0), '00:00'), 'HH:mm') AS early,
                    FORMAT(DATEADD(MINUTE, ISNULL(ATT.WorkingTime, 0), '00:00'), 'HH:mm') AS WorkHour,
					 CASE 
                        WHEN ATT.InDateTime IS NOT NULL AND ISNULL(ATT.LateIn, 0) = 0 AND ISNULL(ATT.EarlyOut, 0) = 0 THEN 'PP'
                        WHEN ATT.InDateTime IS NULL AND ATT.OutDateTime IS NULL AND ATT.ShiftAllocated <> 'WO' AND ATT.LeaveInfo IS NULL THEN 'AA'
                        WHEN ATT.InDateTime IS NOT NULL AND ISNULL(ATT.LateIn, 0) > 0 THEN 'Lt'
                        WHEN ATT.OutDateTime IS NOT NULL AND ISNULL(ATT.EarlyOut, 0) > 0 THEN 'EE'
                        WHEN ATT.ShiftAllocated = 'WO' AND ATT.InDateTime IS NULL AND ATT.OutDateTime IS NULL THEN 'WO'
                        WHEN ATT.LeaveInfo IS NOT NULL THEN 'LV'
                        ELSE ATT.AttendanceStatus
                    END AS status
                FROM [ApprovalWorkFlow].[tblRApprovalSetupMaster] ASM WITH (NOLOCK)
                INNER JOIN tblMEmployee E WITH (NOLOCK) ON ASM.EmployeeID = E.ID
                INNER JOIN dbo.DepartmentEmployee() DeptEmp ON E.ID = DeptEmp.EmployeeID
                INNER JOIN tblMDepartment Dept WITH (NOLOCK) ON Dept.ID = DeptEmp.DepartmentID
                INNER JOIN dbo.DesignationEmployee() DegEmp ON E.ID = DegEmp.EmployeeID
                INNER JOIN tblMDesignation Deg WITH (NOLOCK) ON Deg.ID = DegEmp.DesignationID
                LEFT JOIN Attendance.tblTAttendance ATT WITH (NOLOCK) 
                    ON ATT.EmployeeID = E.ID AND ATT.DATE = CONVERT(DATE, GETDATE())
                WHERE ASM.ApproverEmployeeID = @Id
            `);

        if (result.recordset.length > 0) {
            return res.status(200).send({
                message: "Team members retrieved successfully",
                data: result.recordset
            });
        } else {
            return res.status(404).send({ message: `No team members found for ID '${req.params.id}'` });
        }
    } catch (error) {
        console.error("Error fetching team members:", error);
        return res.status(500).send({
            message: "An error occurred while fetching team members",
            error: error.message
        });
    }
};



module.exports = { approverMapping, getReportingLists, myTeamToday, unAssignedReporteeList };