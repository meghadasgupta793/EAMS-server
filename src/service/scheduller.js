const cron = require('node-cron');
const processAttendanceData = require('./processAttendanceData');
const autoShiftAllocation = require('./autoShiftAllocation');

// Cron job to run every minute
const perMinuteJob = cron.schedule('* * * * *', async () => {
    try {
        console.log('Per Minute Job is Running');
        
        // Wait for the processAttendanceData to complete
        await processAttendanceData();

        console.log('Attendance Processing Completed');
        await autoShiftAllocation();

        console.log('Attendance Processing and Shift Allocation Completed');
    } catch (error) {
        console.error('Error in per minute job:', error);
    }
}, {
    scheduled: false  // This makes sure the job is not running immediately; you can trigger it manually later
});

// Cron job to run every hour
const perHourJob = cron.schedule('0 * * * *', async () => {
    try {
        console.log('Per Hour Job is Running');
        
        // Wait for autoShiftAllocation to complete
        await autoShiftAllocation();

        console.log('Attendance Processing and Shift Allocation Completed');
    } catch (error) {
        console.error('Error in per hour job:', error);
    }
}, {
    scheduled: false  // This makes sure the job is not running immediately; you can trigger it manually later
});

module.exports = { perMinuteJob, perHourJob };
