const { poolPromise, sql } = require("../../config/db");


const getVisitorAllVisitor = async (req, res, next) => {
    try {


        // Fetch visitor record from the database
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request.query(`
                SELECT * FROM VMS.tblMVisitor 
               `);

        res.status(200).send({
            message: "Visitor returned successfully",
            data: result.recordset
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the visitor",
            error: error.message
        });
        next(error);
    }
};


const searchByVisitorMobileNo = async (req, res, next) => {
    const { MobileNo } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MobileNo', sql.VarChar, MobileNo)
            .query(` SELECT [ID]
      ,[VisitorName]
      ,[Email]
	  ,[IdentityType]
      ,[IdentityNo]
      ,[MobileNo]
      ,[VisitorCompany]
      ,[AddressLine1]
	  ,[PictureName]
      ,[Gender]
                FROM [VMS].[tblMVisitor]
                WHERE [MobileNo] = @MobileNo`);

        res.status(200).send({
            message: "Visitor PhoneNumber search successfull",
            data: result.recordset
        })
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).send({
            message: "An error occurred while searach the phoneNumber",
            error: error.message
        });
    }

}


module.exports = {
    getVisitorAllVisitor,
    searchByVisitorMobileNo
}