const express = require('express');
const { getAllUser, login, createUser, logout } = require('../../Controllers/AdminController/userController');
const authenticateToken = require('../../auth/authenticateToken ');
const { checkLicense } = require('../../auth/licCheck');



const userRouter = express.Router();

//userRouter.use(checkLicense);

// Login route (No token verification)
userRouter.post('/Login', (req, res, next) => {
  console.log('Login request received');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
},  login);


// Verify Token route
userRouter.get("/verifyToken", authenticateToken, (req, res) => {
  // If the token is valid, this block will execute, as it passed the middleware
  res.status(200).json({ authenticated: true, userId: req.user.id });
});

userRouter.post('/Logout', logout);
userRouter.get('/', authenticateToken, getAllUser);
userRouter.post('/', createUser);

module.exports = userRouter

