const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const fs = require('fs');
const path = require('path');

const departmentRouter = require("./Routers/AdminRouters/departmentRouter");
const designationRouter = require("./Routers/AdminRouters/designationRouter");
const ouRouter = require("./Routers/AdminRouters/ouRouter");
const shiftRouter = require("./Routers/AdminRouters/shiftRouter");
const holidayRouter = require("./Routers/AdminRouters/holidayRouter");
const userRouter = require("./Routers/AdminRouters/userRouter");
const employeeRouter = require("./Routers/AdminRouters/employeeRouter");
const vmsRouter = require("./Routers/VmsRouters/vmsRouter");
const categoryRouter = require("./Routers/AdminRouters/catagoryRouter");
const batchRouter = require("./Routers/AdminRouters/batchRouter");
const attendanceRouter = require("./Routers/EssRouters/attendanceRouter");
const adminDashboardRouter = require("./Routers/AdminRouters/dashboardRouter");
const approvalRouter = require("./Routers/AdminRouters/approvalRouter");

const app = express();

// ✅ FIX 1: Corrected CORS Configuration
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'accessToken'],
    credentials: true,  // Allow cookies
}));

// ✅ FIX 2: Use express.json() Instead of body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan('dev'));

// Ensure the uploads folder exists
const uploadFolderPath = path.resolve(__dirname, '../public/images');
if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath);
}

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ FIX 3: Route Definitions
app.use('/api/user', userRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/designations', designationRouter);
app.use('/api/categorys',categoryRouter);
app.use('/api/batches',batchRouter)
app.use('/api/ou', ouRouter);
app.use('/api/shift', shiftRouter);
app.use('/api/holiday', holidayRouter);
app.use('/api/vms', vmsRouter);
app.use('/api/attendance',attendanceRouter);
app.use('/api/adminDashboard',adminDashboardRouter)
app.use('/api/approval',approvalRouter)

// Default Route
app.get('/', (req, res) => {
    res.send("Welcome to the Server");
});

// ✅ FIX 4: Proper Error Handling Middleware
app.use((req, res, next) => {
    next(createError(404, 'Route Not Found'));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message,
    });
});

module.exports = app;
