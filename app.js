const express = require('express');
const app = express();
const http = require('http');
const path = require("path");
const Cookies = require('js-cookie');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//setup public folder
app.use('/static',express.static(path.join(__dirname, 'public')));

function middleware(req, res, next) {
    if (Cookies.get('islogin')) {
        next();
    } else {
        console.log(Cookies.get('islogin'));
        res.redirect('/login');
    }
}

app.get('/',middleware,(req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/login',(req, res) => {
    res.sendFile(__dirname + '/login.html');
});
app.get('*',(req, res) => {
    res.sendFile(__dirname + '/404.html');
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