const { poolPromise, sql } = require("../../config/db");

// GET ALL BATCHES
const getAllBatches = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tblMBatch');

        res.status(200).send({
            message: "Batches are returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving batches",
            error: error.message
        });
        next(error);
    }
};

// CREATE BATCH
const createBatch = async (req, res, next) => {
    try {
        const { Code, Name } = req.body;
        if (!Code || !Name) {
            return res.status(400).send({ message: "Code and Name are required" });
        }

        const pool = await poolPromise;
        const checkCode = await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .query('SELECT * FROM tblMBatch WHERE Code = @Code');

        if (checkCode.recordset.length > 0) {
            return res.status(400).send({ message: `Batch with Code '${Code}' already exists` });
        }

        await pool.request()
            .input('Code', sql.VarChar(20), Code)
            .input('Name', sql.VarChar(100), Name)
            .query(`INSERT INTO tblMBatch (Code, Name) VALUES (@Code, @Name);`);

        res.status(201).send({
            message: "Batch created successfully",
            data: { Code, Name }
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while creating the batch",
            error: error.message
        });
        next(error);
    }
};

// UPDATE BATCH
const updateBatch = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMBatch WHERE Id = @Id');

        if (result.recordset.length) {
            const { Code, Name } = req.body;
            await pool.request()
                .input('Id', sql.Int, req.params.id)
                .input('Code', sql.VarChar(20), Code)
                .input('Name', sql.VarChar(100), Name)
                .query(`UPDATE tblMBatch SET Code = @Code, Name = @Name WHERE Id = @Id;`);

            res.status(200).send({
                message: "Batch updated successfully",
                data: { Id: req.params.id, Code, Name }
            });
        } else {
            return res.status(404).send({ message: `Batch with ID '${req.params.id}' not found` });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while updating the batch",
            error: error.message
        });
        next(error);
    }
};

// DELETE BATCH
const deleteBatch = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const batchId = req.params.id;
        const result = await pool.request()
            .input('Id', sql.Int, batchId)
            .query('SELECT * FROM tblMBatch WHERE Id = @Id');

        if (result.recordset.length > 0) {
            await pool.request()
                .input('Id', sql.Int, batchId)
                .query('DELETE FROM tblMBatch WHERE Id = @Id');

            res.status(200).send({ message: `Batch with ID '${batchId}' deleted successfully` });
        } else {
            return res.status(404).send({ message: `Batch with ID '${batchId}' not found` });
        }
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while deleting the batch",
            error: error.message
        });
        next(error);
    }
};

// GET BATCH BY ID
const getBatchById = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('SELECT * FROM tblMBatch WHERE Id = @Id');

        res.status(200).send({
            message: "Batch is returned",
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving the batch",
            error: error.message
        });
        next(error);
    }
};

module.exports = { getAllBatches, createBatch, updateBatch, deleteBatch, getBatchById };
