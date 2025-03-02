const app = require('./app')
const { serverPort } = require('./secret')







// Listen on all network interfaces (0.0.0.0) to allow external access
app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${serverPort}`);
    console.log(`Access it from your phone: http://192.168.1.5:${serverPort}`);
});