const { poolPromise, sql } = require("../../config/db");

//GET ALL DEPARTMENTS 
const getAllDepartment = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tblMDepartment');

        res.status(200).send({
            message: "Departments are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving departments",
            error: error.message
        });
        next(error);
    }
};


///create department 
const createDepartment = async (req, res, next) => {
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
            .query('SELECT * FROM tblMDepartment WHERE Code = @Code');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({
                message: `Department with Code '${Code}' already exists`
            });
        }

        // Proceed with the insert if the code doesn't exist
        const result = await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .input('Name', sql.VarChar(100), Name)
            .query(`
                INSERT INTO tblMDepartment (Code, Name)
                VALUES (@Code, @Name);
            `);

        res.status(201).send({
            message: "Department created successfully",
            data: {
                Code,
                Name
            }
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the department",
            error: error.message
        });
        next(error);
    }
};


const updateDepartment = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        // Fetch department record from the database
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMDepartment WHERE Id = @Id');

        // If department record exists, update it
        if (result.recordset.length) {
            const { Code, Name } = req.body;

        
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .input('Code', sql.VarChar(20), Code)
                .input('Name', sql.VarChar(100), Name)
                .query(`
                    UPDATE tblMDepartment
                    SET Code = @Code, Name = @Name
                    WHERE Id = @Id;
                `);

            res.status(200).send({
                message: "Department updated successfully",
                data: {
                    Id: req.params.id,
                    Code,
                    Name
                }
            });
        } else {
            // Department not found
            return res.status(404).send({
                message: `Department with ID '${req.params.id}' not found`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the department",
            error: error.message
        });
        next(error);
    }
};


const deleteDepartment = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const departmentId = req.params.id;

        console.log("Deleting department with ID:", departmentId); // Debugging log

        // Check if the department exists
        const result = await pool.request()
            .input('Id', sql.Int, departmentId)
            .query('SELECT * FROM tblMDepartment WHERE Id = @Id');

        if (result.recordset.length > 0) {
            // Delete the department
            await pool.request()
                .input('Id', sql.Int, departmentId)
                .query('DELETE FROM tblMDepartment WHERE Id = @Id');

            res.status(200).send({
                message: `Department with ID '${departmentId}' deleted successfully`
            });
        } else {
            return res.status(404).send({
                message: `Department with ID '${departmentId}' not found`
            });
        }
    } catch (error) {
        console.error("Error deleting department:", error.message); // Debugging log
        res.status(500).send({
            message: "An error occurred while deleting the department",
            error: error.message
        });
        next(error);
    }
};



//GET ALL DEPARTMENTS 
const getDepartmentByIdQuery = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('Id', sql.Int, req.params.id)
        .query('SELECT * FROM tblMDepartment WHERE Id = @Id');

        res.status(200).send({
            message: "Departments are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving departments",
            error: error.message
        });
        next(error);
    }
};







module.exports = { getAllDepartment , createDepartment, updateDepartment, deleteDepartment,getDepartmentByIdQuery}