const { poolPromise, sql } = require("../../config/db");

const getAttendanceRawData = async (req, res, next) => {
    try {
        const { OuId, DepartmentId, EmployeeId, FromDate,ToDate } = req.body;

     

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('OuId', OuId);
        request.input('DepartmentId', DepartmentId);
        request.input('EmployeeId', EmployeeId);
        request.input('FromDate', FromDate); 
        request.input('ToDate', ToDate); 

        // Execute stored procedure
        const result = await request.execute('spRGetAttendanceRawData');

        res.status(200).send({
            message: "Punch Data Report returned successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error("Error in Punch Data Report:", error.message);
        res.status(500).send({
            message: "An error occurred while retrieving  Punch Data Report:",
            error: error.message
        });
        next(error);
    }
};

module.exports = {
    getAttendanceRawData
};
