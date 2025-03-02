const { poolPromise, sql } = require("../../config/db");


// approverMapping
const approverMapping = async (req, res, next) => {
    try {
        const { EmployeeID, ApprovalLevel,ApproverEmployeeID,LastUpdatedBy } = req.body;
        if (!EmployeeID || !ApproverEmployeeID) {
            return res.status(400).send({ message: "Code and Name are required" });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('EmployeeID',  EmployeeID)
            .input('ApprovalLevel', ApprovalLevel)
            .input('ApproverEmployeeID',  ApproverEmployeeID)
            .input('LastUpdatedBy',  LastUpdatedBy)

            .query(`insert into ApprovalWorkFlow.tblRApprovalSetupMaster
  (EmployeeID,ApprovalLevel,ApproverEmployeeID,LastUpdatedOn,LastUpdatedBy)
  Values (@EmployeeID,@ApprovalLevel,@ApproverEmployeeID,Getdate(),@LastUpdatedBy)`);

        res.status(201).send({
            message: "approvarMapping created successfully",
            data: {  EmployeeID, ApprovalLevel,ApproverEmployeeID }
        });
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
            level:row.Level
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
            empPhoto: row.PictureName ,
            name: row.EmployeeName,
            empNo: row.EmpNo,
            designation: row.Designation,
            department: row.Department,
            level:row.Level
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
                    E.EmpNo, 
                    E.EmployeeName, 
                    E.PictureName, 
                    Deg.Name AS Designation,
                    Dept.Name AS Department,
                    FORMAT(ATT.InDateTime, 'HH:mm') AS inTime,
                    FORMAT(ATT.OutDateTime, 'HH:mm') AS outTime
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



module.exports = { approverMapping ,getReportingLists,myTeamToday};