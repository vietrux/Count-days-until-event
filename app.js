const express = require('express');
const app = express();
const http = require('http');
var path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//setup public folder
app.use('/static',express.static(path.join(__dirname, 'public')));

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
    console.log('listening on PORT:'+ process.env.PORT);
});