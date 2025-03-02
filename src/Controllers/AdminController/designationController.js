const { poolPromise, sql } = require("../../config/db");

//GET ALL designationS 
const getAlldesignation = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tblMDesignation');

        res.status(200).send({
            message: "designations are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving designations",
            error: error.message
        });
        next(error);
    }
};

const getDesignationByIdQuery = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('Id', sql.Int, req.params.id)
        .query('SELECT * FROM tblMDesignation WHERE Id = @Id');

        res.status(200).send({
            message: "Designation are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving Designation",
            error: error.message
        });
        next(error);
    }
};


///create designation 
const createdesignation = async (req, res, next) => {
    try {
        const { Code, Name } = req.body;

        // Validate input
        if (!Code || !Name) {
            return res.status(400).send({
                message: "Code and Name are required"
            });
        }

        const pool = await poolPromise;

        // Check if the Code already exists
        const checkCode = await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .query('SELECT * FROM tblMDesignation WHERE Code = @Code');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `designation with Code '${Code}' already exists`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .input('Name', sql.VarChar(100), Name)
            .query(`
                INSERT INTO tblMDesignation (Code, Name)
                VALUES (@Code, @Name);
            `);

        res.status(201).send({
            message: "designation created successfully",
            data: {
                Code,
                Name
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the designation",
            error: error.message
        });
        next(error);
    }
};


const updatedesignation = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch designation record from the database
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMDesignation WHERE Id = @Id');

        // If designation record exists, update it
        if (result.recordset.length) {
            const { Code, Name } = req.body;

        
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .input('Code', sql.VarChar(20), Code)
                .input('Name', sql.VarChar(100), Name)
                .query(`
                    UPDATE tblMDesignation
                    SET Code = @Code, Name = @Name
                    WHERE Id = @Id;
                `);

            res.status(200).send({
                message: "designation updated successfully",
                data: {
                    Id: req.params.id,
                    Code,
                    Name
                }
            });
        } else {
            // designation not found
            return res.status(404).send({
                message: `designation with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the designation",
            error: error.message
        });
        next(error);
    }
};


const deletedesignation = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Check if the designation exists
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMDesignation WHERE Id = @Id');

        if (result.recordset.length) {
            // Delete the designation
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .query('DELETE FROM tblMDesignation WHERE Id = @Id');

            res.status(200).send({
                message: `designation with ID '${req.params.id}' deleted successfully`
            });
        } else {
            // designation not found
            return res.status(404).send({
                message: `designation with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the designation",
            error: error.message
        });
        next(error);
    }
};







module.exports = { getAlldesignation ,getDesignationByIdQuery, createdesignation, updatedesignation, deletedesignation}