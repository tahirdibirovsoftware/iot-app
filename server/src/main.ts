import express, { Request, Response } from 'express';
import cors from 'cors';
import { ReadlineParser, SerialPort } from 'serialport';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this if your client's URL changes
    methods: ['GET', 'POST'], // Methods you want to allow
    allowedHeaders: ['Content-Type'], // Headers you want to allow
    credentials: true // If your client needs to send cookies to the server
}));

const server = createServer(app);
const PORT = 3000;
const io = new SocketIOServer(server, {
    cors: {
        origin: 'http://localhost:5173', // Ensure this matches your client's URL
        methods: ['GET', 'POST']
    }
});

// Store connections mapped by socket ID
const connections = {};

const listDevices = async () => {
    try {
        const devices = await SerialPort.list();
        return devices;
    } catch (error) {
        console.error('Failed to list devices:', error);
        throw error;
    }
}

const configurePort = (socketId, baudRate = 57600, path) => {
    // Close previous port if it exists
    if (connections[socketId] && connections[socketId].port) {
        connections[socketId].port.close();
    }

    // Open a new serial port
    const port = new SerialPort({ baudRate, path, autoOpen: false });
    port.on('open', () => console.log(`Port opened on ${path}`));
    port.on('error', (error) => console.error('Serial port error:', error));
    port.on('close', () => console.log('Port closed'));

    // Use Readline parser
    const parser = port.pipe(new ReadlineParser());
    parser.on('data', (data) => {
        console.log('Data:', data);
        io.to(socketId).emit('iot-data', data); // Send data only to the requesting client
    });

    // Store port in connections map
    connections[socketId] = { port, parser };

    // Open the port
    port.open();

    return port;
}

app.get('/devices', async (req: Request, res: Response) => {
    try {
        const devices = await listDevices();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).send('Failed to list devices');
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('iot-path', (path) => {
        configurePort(socket.id, 57600, path);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (connections[socket.id] && connections[socket.id].port) {
            connections[socket.id].port.close(); // Ensure port is closed on disconnect
        }
        delete connections[socket.id]; // Clean up connection entry
    });
});

server.listen(PORT, () => {
    console.log(`IoT Server started on ${PORT}`);
});
