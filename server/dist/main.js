"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serialport_1 = require("serialport");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Adjust this if your client's URL changes
    methods: ['GET', 'POST'], // Methods you want to allow
    allowedHeaders: ['Content-Type'], // Headers you want to allow
    credentials: true // If your client needs to send cookies to the server
}));
const server = (0, http_1.createServer)(app);
const PORT = 3000;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Ensure this matches your client's URL
        methods: ['GET', 'POST']
    }
});
const listDevices = async () => {
    try {
        const devices = await serialport_1.SerialPort.list();
        return devices;
    }
    catch (error) {
        console.error('Failed to list devices:', error);
        throw error; // Rethrow or handle as needed
    }
};
const configurePort = (baudRate = 57600, path) => {
    const port = new serialport_1.SerialPort({
        baudRate,
        path,
        autoOpen: true // Consider setting this to false if manual control is needed
    });
    port.on('error', (error) => console.error('Serial port error:', error));
    return port;
};
app.get('/devices', async (req, res) => {
    try {
        const devices = await listDevices();
        res.status(200).json(devices);
    }
    catch (error) {
        res.status(500).send('Failed to list devices');
    }
});
io.on('connection', (socket) => {
    socket.on('iot-path', (path) => {
        const port = configurePort(57600, path);
        const parser = port.pipe(new serialport_1.ReadlineParser());
        parser.on('data', (iotData) => {
            console.log(iotData);
            socket.emit('iot-data', iotData); // Consider using io.emit if broadcasting is needed
        });
    });
});
server.listen(PORT, () => {
    console.log(`IoT Server started on ${PORT}`);
});
