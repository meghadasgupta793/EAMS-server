const { poolPromise, sql } = require("../../config/db");

const empDateWiseReport = async (req, res, next) => {
    try {
        const { EmployeeId, FromDate,ToDate } = req.body;

     

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
 
        request.input('EmployeeId', EmployeeId);
        request.input('FromDate', FromDate); 
        request.input('ToDate', ToDate); 

        // Execute stored procedure
        const result = await request.execute('spRDateWiseAttendanceReport');

        res.status(200).send({
            message: "empDateWiseReport returned successfully",
            data: result.recordset
        });

    } catch (error) {
        console.error("Error in empDateWiseReport:", error.message);
        res.status(500).send({
            message: "An error occurred while retrieving  empDateWiseReport:",
            error: error.message
        });
        next(error);
    }
};

module.exports = {
    empDateWiseReport
};
