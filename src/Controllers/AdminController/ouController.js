const { poolPromise, sql } = require("../../config/db");

// GET ALL Ou
const getAllOu = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            select OU.ID ID,OU.OUCode OUCode,OU.OUName OUName,POU.ID ParentOU,POU.OUCode ParentOUCode,
            OT.ID OUType,OT.OUType OUTypeName,OW.ID OwnerID,OW.Name OwnerName
            from tblMOU (NOLOCK) OU
            inner join tblMOUType (NOLOCK)  OT on OU.OUType=OT.ID
            inner join tblMOwner (NOLOCK) OW on OU.OwnerID=OW.ID
            left join tblMOU (NOLOCK) POU on POU.ID=OU.ParentOU
        `);

        if (result.recordset.length > 0) {
            res.status(200).send({
                message: "OUs retrieved successfully",
                data: result.recordset
            });
        } else {
            res.status(404).send({
                message: "No OUs found"
            });
        }
    } catch (error) {
        console.error("Error retrieving OUs:", error);
        res.status(500).send({
            message: "An error occurred while retrieving OUs",
            error: error.message
        });
        next(error); // Optional, if you have global error handling middleware
    }
};


const getOuById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOu WHERE Id = @Id');

        res.status(200).send({
            message: "Ou is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the Ou",
            error: error.message
        });
        next(error);
    }
};

const createOU = async (req, res, next) => {
    try {
        const { OUCode, OUName, OUType, ParentOU, OwnerID } = req.body;

        // Validate input
        if (!OUCode || !OUName) {
            return res.status(400).send({
                message: "OUCode and OUName are required"
            });
        }

        const pool = await poolPromise;

        // Check if the Code already exists
        const checkCode = await pool.request()
            .input('OUCode', sql.VarChar(20), OUCode)
            .query('SELECT * FROM tblMOU WHERE OUCode = @OUCode');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `OU with Code '${OUCode}' already exists`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()
            .input('OUCode', sql.VarChar(20), OUCode)
            .input('OUName', sql.VarChar(100), OUName)
            .input('OUType', sql.Int, OUType)
            .input('ParentOU', sql.Int, ParentOU)
            .input('OwnerID', sql.Int, OwnerID)

            .query(`
                INSERT INTO tblMOU (OUCode, OUName,OUType,ParentOU,OwnerID)
                VALUES (@OUCode, @OUName,@OUType,@ParentOU,@OwnerID);
            `);

        res.status(201).send({
            message: "OU created successfully",
            data: {
                OUCode, OUName, OUType, ParentOU, OwnerID
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the OU",
            error: error.message
        });
        next(error);
    }
};



// UPDATE OU
const updateOU = async (req, res, next) => {
    try {
      const pool = await poolPromise;
  
      // Fetch OU record from the database
      const result = await pool.request()
        .input('Id', sql.Int, req.params.id)
        .query('SELECT * FROM tblMOU WHERE ID = @Id');
  
      // If OU record exists, update it
      if (result.recordset.length) {
        const { OUName, OUType, ParentOU, OwnerID } = req.body;
        const OUCode = result.recordset[0].OUCode; // Fetch OUCode from the database
  
        await pool.request()
          .input('Id', sql.Int, req.params.id)
          .input('OUName', sql.VarChar(100), OUName)
          .input('OUType', sql.Int, OUType)
          .input('ParentOU', sql.Int, ParentOU)
          .input('OwnerID', sql.Int, OwnerID)
          .query(`
            UPDATE tblMOU
            SET OUName = @OUName, OUType = @OUType, ParentOU = @ParentOU, OwnerID = @OwnerID
            WHERE ID = @Id;
          `);
  
        res.status(200).send({
          message: "OU updated successfully",
          data: {
            Id: req.params.id,
            OUCode, // Include the fetched OUCode in the response
            OUName,
            OUType,
            ParentOU,
            OwnerID
          }
        });
      } else {
        // OU not found
        return res.status(404).send({
          message: `OU with ID '${req.params.id}' not found`
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "An error occurred while updating the OU",
        error: error.message
      });
      next(error);
    }
  };


//Delete Ou

const deleteOU = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch OU record from the database to check if it exists
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOU WHERE ID = @Id');

        // If OU record exists, delete it
        if (result.recordset.length) {
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .query('DELETE FROM tblMOU WHERE ID = @Id');

            res.status(200).send({
                message: `OU with ID '${req.params.id}' deleted successfully`
            });
        } else {
            // OU not found
            return res.status(404).send({
                message: `OU with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the OU",
            error: error.message
        });
        next(error);
    }
};


//get all ouType

const getAllOuType = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tblMOUType');

        if (result.recordset.length > 0) {
            res.status(200).send({
                message: "OUType are retrieved successfully",
                data: result.recordset
            });
        } else {
            res.status(404).send({
                message: "No OUType found"
            });
        }
    } catch (error) {
        console.error("Error retrieving OUType:", error);
        res.status(500).send({
            message: "An error occurred while retrieving OUType",
            error: error.message
        });
        next(error); // Optional, if you have global error handling middleware
    }
}

const getOuTypeById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOuType WHERE Id = @Id');

        res.status(200).send({
            message: "OuType is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the OuType",
            error: error.message
        });
        next(error);
    }
};

//Create OuType
const createOuType = async (req, res, next) => {
    try {
        const { OUType } = req.body;

        // Validate input
        if (!OUType) {
            return res.status(400).send({
                message: "OUType are required"
            });
        }

        const pool = await poolPromise;

        // Check if the Code already exists
        const checkCode = await pool.request()
            .input('OUType', sql.VarChar(50), OUType)
            .query('SELECT * FROM tblMOUType WHERE OUType = @OUType');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `OUType '${OUType}' already exists`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()

            .input('OUType', sql.VarChar(50), OUType)


            .query(`
                INSERT INTO tblMOUType (OUType)
                VALUES (@OUType);
            `);

        res.status(201).send({
            message: "OuType created successfully",
            data: {
                OUType
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the OuType",
            error: error.message
        });
        next(error);
    }
};


//Update OuTYpe
const updateOuType = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch OU record from the database
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOUType WHERE ID = @Id');

        // If OU record exists, update it
        if (result.recordset.length) {
            const { OUType } = req.body;

            await pool.request()
                .input('Id', sql.Int, req.params.id)

                .input('OUType', sql.VarChar(50), OUType)

                .query(`
                    UPDATE tblMOUType
                    SET OUType = @OUType
                    WHERE ID = @Id;
                `);

            res.status(200).send({
                message: "OUType updated successfully",
                data: {
                    Id: req.params.id,
                    OUType,

                }
            });
        } else {
            // OuType not found
            return res.status(404).send({
                message: `OuType with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the OuType",
            error: error.message
        });
        next(error);
    }
};

const deleteOUType = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch OU record from the database to check if it exists
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOUType WHERE ID = @Id');

        // If OU record exists, delete it
        if (result.recordset.length) {
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .query('DELETE FROM tblMOUType WHERE ID = @Id');

            res.status(200).send({
                message: `OUType with ID '${req.params.id}' deleted successfully`
            });
        } else {
            // OU not found
            return res.status(404).send({
                message: `OUType with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the OUType",
            error: error.message
        });
        next(error);
    }
};



// get All OuOwner

const getAllOuOwner = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        console.log("Connected to the database"); // Debugging log

        const result = await pool.request().query('SELECT * FROM tblMOwner');

        // Log the result for debugging
        console.log("Query executed, result:", result);

        if (result.recordset.length > 0) {
            res.status(200).send({
                message: "OUOwner are retrieved successfully",
                data: result.recordset
            });
        } else {
            res.status(404).send({
                message: "No OUOwner found"
            });
        }
    } catch (error) {
        console.error("Error retrieving OUOwner:", error);

        // Properly format the error response
        res.status(500).send({
            message: "An error occurred while retrieving OUOwner",
            error: error.message
        });

        if (next) next(error); // Optional if you want to forward the error
    }
};

const getOuOwnerById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOuOwner WHERE Id = @Id');

        res.status(200).send({
            message: "OuOwner is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the OuOwner",
            error: error.message
        });
        next(error);
    }
};



// create OuOwner

const createOuOwner = async (req, res, next) => {

    try {
        const { Name, EmailID, MobNo, SecondaryEmailID } = req.body;

        // Validate input
        if (!Name || !EmailID) {
            return res.status(400).send({
                message: "Name and EmailID are required"
            });
        }

        const pool = await poolPromise;

        // Check if the Code already exists
        const checkCode = await pool.request()
            .input('Name', sql.VarChar(50), Name)
            .query('SELECT * FROM tblMOwner WHERE Name = @Name');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `EmailID with Name '${Name}' already exists`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()
            .input('Name', sql.VarChar(50), Name)
            .input('EmailID', sql.VarChar(50), EmailID)
            .input('MobNo', sql.VarChar(50), MobNo)
            .input('SecondaryEmailID', sql.VarChar(50), SecondaryEmailID)


            .query(`
                INSERT INTO tblMOwner ( Name, EmailID, MobNo, SecondaryEmailID)
                VALUES (@Name, @EmailID,@MobNo,@SecondaryEmailID);
            `);

        res.status(201).send({
            message: "OuOwner created successfully",
            data: {
                Name, EmailID, MobNo, SecondaryEmailID
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the OuOwner",
            error: error.message
        });
        next(error);
    }
};



// Update OuOwner
const updateOuOwner = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch OUOwner record from the database using Id
        const result = await pool.request()
            .input('id', sql.Int, req.params.id) // Ensure correct type
            .query('SELECT * FROM tblMOwner WHERE Id = @id');

        // If OUOwner record exists, update it
        if (result.recordset.length) {
            const { MobNo, SecondaryEmailID, Name, EmailID } = req.body;

            console.log("Request Body:", req.body);
            console.log("Updating OUOwner with ID:", req.params.id);

            await pool.request()
                .input('id', sql.Int, req.params.id) // Use 'id' consistently
                .input('Name', sql.NVarChar, Name)
                .input('EmailID', sql.NVarChar, EmailID)
                .input('MobNo', sql.NVarChar, MobNo)
                .input('SecondaryEmailID', sql.NVarChar, SecondaryEmailID)
                .query(`
                    UPDATE tblMOwner
                    SET Name = @Name, EmailID = @EmailID, MobNo = @MobNo, SecondaryEmailID = @SecondaryEmailID
                    WHERE Id = @id;
                `);

            res.status(200).send({
                message: "OUOwner updated successfully",
                data: {
                    id: req.params.id,
                    Name,
                    EmailID,
                    MobNo,
                    SecondaryEmailID,
                }
            });
        } else {
            // OUOwner not found
            return res.status(404).send({
                message: `OUOwner with Id '${req.params.id}' not found`
            });
        }
    } catch (error) {
        console.error("Error updating OUOwner:", error);
        res.status(500).send({
            message: "An error occurred while updating the OUOwner",
            error: error.message
        });
    }
};

const deleteOUOwner = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch OU record from the database to check if it exists
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMOwner WHERE ID = @Id');

        // If OU record exists, delete it
        if (result.recordset.length) {
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .query('DELETE FROM tblMOwner WHERE ID = @Id');

            res.status(200).send({
                message: `OUOwner with ID '${req.params.id}' deleted successfully`
            });
        } else {
            // OU not found
            return res.status(404).send({
                message: `OUOwner with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the OUOwner",
            error: error.message
        });
        next(error);
    }
};





module.exports = {
    getAllOu,
    getOuById,
    createOU,
    updateOU,
    deleteOU,

    getAllOuType,
    getOuTypeById,
    createOuType,
    updateOuType,
    deleteOUType,

    createOuOwner,
    getOuOwnerById,
    getAllOuOwner,
    updateOuOwner,
    deleteOUOwner

};
