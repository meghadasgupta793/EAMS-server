const { poolPromise, sql } = require("../../config/db");

// GET ALL CATEGORIES
const getAllCategories = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tblMCategory');

        res.status(200).send({
            message: "Categories are returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving categories",
            error: error.message
        });
        next(error);
    }
};

// CREATE CATEGORY
const createCategory = async (req, res, next) => {
    try {
        const { Code, Name } = req.body;
        if (!Code || !Name) {
            return res.status(400).send({ message: "Code and Name are required" });
        }

        const pool = await poolPromise;
        const checkCode = await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .query('SELECT * FROM tblMCategory WHERE Code = @Code');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({ message: `Category with Code '${Code}' already exists` });
        }

        await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .input('Name', sql.VarChar(100), Name)
            .query(`INSERT INTO tblMCategory (Code, Name) VALUES (@Code, @Name);`);

        res.status(201).send({
            message: "Category created successfully",
            data: { Code, Name }
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the category",
            error: error.message
        });
        next(error);
    }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMCategory WHERE Id = @Id');

        if (result.recordset.length) {
            const { Code, Name } = req.body;
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .input('Code', sql.VarChar(20), Code)
                .input('Name', sql.VarChar(100), Name)
                .query(`UPDATE tblMCategory SET Code = @Code, Name = @Name WHERE Id = @Id;`);

            res.status(200).send({
                message: "Category updated successfully",
                data: { Id: req.params.id, Code, Name }
            });
        } else {
            return res.status(404).send({ message: `Category with ID '${req.params.id}' not found` });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the category",
            error: error.message
        });
        next(error);
    }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const categoryId = req.params.id;
        const result = await pool.request()
            .input('Id', sql.Int, categoryId)
            .query('SELECT * FROM tblMCategory WHERE Id = @Id');

        if (result.recordset.length > 0) {
            await pool.request()
                .input('Id', sql.Int, categoryId)
                .query('DELETE FROM tblMCategory WHERE Id = @Id');

            res.status(200).send({ message: `Category with ID '${categoryId}' deleted successfully` });
        } else {
            return res.status(404).send({ message: `Category with ID '${categoryId}' not found` });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the category",
            error: error.message
        });
        next(error);
    }
};

// GET CATEGORY BY ID
const getCategoryById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMCategory WHERE Id = @Id');

        res.status(200).send({
            message: "Category is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the category",
            error: error.message
        });
        next(error);
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryById };
