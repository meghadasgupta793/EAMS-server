const { poolPromise, sql } = require("../../config/db");



const DashBoardAppointmentStatusCount = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date } = req.body;


        // Logging to verify request body
        console.log("Request Body:", req.body);


        if (!UserRole || !EmployeeId || !date) {
            return res.status(400).send({
                message: "UserRole and EmployeeId and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);

        // Execute stored procedure
        const result = await request.execute('VMS.spLDashBoardAppointmentStatusCount');

        res.status(200).send({
            message: "VisitorDashBoardCount are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving VisitorDashBoardCount",
            error: error.message
        });
        next(error);
    }
}

const DashBoardAppointmentStatusDetails = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date, AppointmentStatus } = req.body;


        // Logging to verify request body
        console.log("Request Body:", req.body);


        if (!UserRole || !EmployeeId || !date || !AppointmentStatus) {
            return res.status(400).send({
                message: "UserRole and EmployeeId and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);
        request.input('AppointmentStatus', AppointmentStatus);


        // Execute stored procedure
        const result = await request.execute('VMS.spLDashBoardAppointmentStatusDetails');

        res.status(200).send({
            message: "VisitorDashBoardDetails are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving VisitorDashBoardDetails",
            error: error.message
        });
        next(error);
    }
}

const VisitorInvitationOverView = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date } = req.body;


        // Logging to verify request body
        console.log("Request Body:", req.body);


        if (!UserRole || !EmployeeId || !date) {
            return res.status(400).send({
                message: "UserRole and EmployeeId and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);

        // Execute stored procedure
        const result = await request.execute('VMS.spLVisitorInvitationOverView');

        res.status(200).send({
            message: "VisitorInvitationOverView are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving VisitorInvitationOverView",
            error: error.message
        });
        next(error);
    }
}

const VisitorInvitationOverViewDetails = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date, InvitationStatus } = req.body;


        // Logging to verify request body
        console.log("Request Body:", req.body);


        if (!UserRole || !EmployeeId || !date || !InvitationStatus) {
            return res.status(400).send({
                message: "UserRole and EmployeeId and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('Date', date);
        request.input('InvitationStatus', InvitationStatus);


        // Execute stored procedure
        const result = await request.execute('VMS.spLVisitorInvitationOverViewDetails');

        res.status(200).send({
            message: "VisitorInvitationOverViewDetails are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving VisitorInvitationOverViewDetails",
            error: error.message
        });
        next(error);
    }
}

const VisitorAppointmentAnalytics = async (req, res, next) => {
    try {
        const { UserRole, EmployeeId, date, AppointmentStatus } = req.body;


        // Logging to verify request body
        console.log("Request Body:", req.body);


        if (!UserRole || !EmployeeId || !AppointmentStatus) {
            return res.status(400).send({
                message: "UserRole and EmployeeId and Date are required"
            });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Set input parameters
        request.input('UserRole', UserRole);
        request.input('EmployeeId', EmployeeId);
        request.input('AppointmentStatus', AppointmentStatus);


        // Execute stored procedure
        const result = await request.execute('VMS.spLAppointmentAnalytics');

        res.status(200).send({
            message: "VisitorAppointmentAnalytics are returned",
            data: result.recordset
        })

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving VisitorAppointmentAnalytics",
            error: error.message
        });
        next(error);
    }
}

module.exports = {
    DashBoardAppointmentStatusCount,
    DashBoardAppointmentStatusDetails,
    VisitorInvitationOverView,
    VisitorInvitationOverViewDetails,
    VisitorAppointmentAnalytics
}
