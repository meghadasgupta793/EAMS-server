const express = require('express');
const { getAllOu, createOU, updateOU, deleteOU,
    getAllOuType, createOuType, updateOuType,
    getAllOuOwner, createOuOwner, 
    updateOuOwner,
    getOuById,
    getOuTypeById,
    getOuOwnerById,
    deleteOUType,
    deleteOUOwner} = require('../../Controllers/AdminController/ouController');

const ouRouter = express.Router();


ouRouter.get('/getAllOu', getAllOu); // Get all ous
ouRouter.get('/ou/:id',getOuById)
ouRouter.post('/createOu', createOU); // Create  ou
ouRouter.put('/updateOu/:id', updateOU); // update  ou
ouRouter.delete('/deleteOu/:id', deleteOU); // update  ou

ouRouter.get('/getAllOuType', getAllOuType); // Get all ouType
ouRouter.get('/getAllOuType:id', getOuTypeById); // Get all ouType
ouRouter.post('/createOuType', createOuType); // Create  ouType
ouRouter.put('/updateOuType/:id', updateOuType); // update  outype
ouRouter.delete('/deleteOuType/:id', deleteOUType); // update  ou

ouRouter.get('/getAllOuOwner', getAllOuOwner); // Get all ouOwner
ouRouter.get('/ouOwner/:id', getOuOwnerById); // Get all ouOwner
ouRouter.post('/createOuOwner', createOuOwner); // Create  ouOwner
ouRouter.put('/updateOuOwner/:id', updateOuOwner); // update  outype
ouRouter.delete('/deleteOuOwner/:id', deleteOUOwner); // update  ou



module.exports = ouRouter