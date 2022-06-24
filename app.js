const express = require('express');
const app = express();
const http = require('http');
const path = require("path");
const enforce = require('express-sslify');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(enforce.HTTPS({ trustProtoHeader: true }));

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
        } else {
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
     console.log('-------------------------a user connected------------------------------------');
     console.log(socket.id);
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
        //check if useronl[objData.email] exist
        if (!useronl[objData.email]) {
            useronl[objData.email] = [];
        }
        useronl[objData.email].push(socket.id);
         console.log(useronl);
        socket.on('disconnect', () => {
             console.log('-------------------------a user disconnected------------------------------------');
             console.log(socket.id);
            useronl[objData.email].splice(useronl[objData.email].indexOf(socket.id), 1);
            //if array empty, delete user r
            if (useronl[objData.email].length == 0) {
                delete useronl[objData.email];
            }
             console.log(useronl);
            io.emit('count', Object.keys(useronl).length);
        });
        io.emit('count', Object.keys(useronl).length);
    }
});

if (process.env.PORT === undefined) {
    port = 3000;
} else {
    port = process.env.PORT;
}
server.listen(port, () => {
    // console.log('listening on PORT:' + port);
});