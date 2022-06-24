const express = require('express');
const app = express();
const http = require('http');
const path = require("path");
const jwtDecode = require('jwt-decode');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//setup public folder
app.use('/static', express.static(path.join(__dirname, 'public')));

var useronl = {};

function middleware(req, res, next) {
    //get cookie
    let cookie = req.headers.cookie;
    if (cookie) {
        let output = {};
        cookie.split(/\s*;\s*/).forEach(function (pair) {
            pair = pair.split(/\s*=\s*/);
            output[pair[0]] = pair.splice(1).join('=');
        });
        let objData = JSON.parse(JSON.stringify(output, null, 4));
        if (objData.islogin) {
            next();
        }else{
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

app.get('/', middleware, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});
app.get('/check', (req, res) => {
    res.json({
        message: 'OK'
    });
});
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/404.html');
});


io.on('connection', (socket) => {
    console.log('a user connected');
//    get header cookie
    let cookie = socket.handshake.headers.cookie;
    if (cookie) {
        let output = {};
        cookie.split(/\s*;\s*/).forEach(function (pair) {
            pair = pair.split(/\s*=\s*/);
            output[pair[0]] = pair.splice(1).join('=');
        });
        let objData = JSON.parse(JSON.stringify(output, null, 4));
        //add user to online
        useronl[objData.email] = socket.id;
        console.log(useronl);
    }

    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('count', Object.keys(useronl).length);
        //remove user from online
        for (let key in useronl) {
            if (useronl[key] === socket.id) {
                delete useronl[key];
            }
        }
    });
    io.emit('count', Object.keys(useronl).length);
});

if (process.env.PORT === undefined) {
    port = 3000;
} else {
    port = process.env.PORT;
}
server.listen(port, () => {
    console.log('listening on PORT:' + port);
});