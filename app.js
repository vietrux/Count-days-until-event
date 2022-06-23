const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// const auth = require('./auth');

app.get('/',(req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('count', io.engine.clientsCount);
    });
    io.emit('count', io.engine.clientsCount);
});

server.listen(process.env.PORT, () => {
    console.log('listening on *:3000');
});