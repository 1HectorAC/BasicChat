
require('dotenv').config()
const express = require('express')
const http = require("http")
const {Server} = require("socket.io")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin:"*", methods:['GET']}});

const PORT = process.env.PORT ?? "5000";

app.get("/", (req, res) => {
    res.send("Test is working");
})

io.on('connection', socket => {
    console.log("user connected: " + socket.id);

    socket.on('createRoom', room => {
        console.log("Room created: " + room + " by: " + socket.id);
        // add check if room already exits, shouldnt
        socket.join(room);
    })
    socket.on('joinRoom', ({room, userName}) => {
        console.log("Room joined: " + room + " by: " + userName + " " + socket.id);
        // add check if room already exits, should
        socket.join(room);
        socket.to(room).emit("userJoined", {otherUser:userName});
    })
    socket.on('offer', ({offer, room, userName}) => {
        console.log("offer received, " + userName);
        socket.to(room).emit("offer", {offer, otherUser:userName});
    })

    socket.on('answer', ({room, answer}) => {
        console.log("answer received")
        socket.to(room).emit('answer', answer);
    })

    socket.on('ice-candidate', ({room, candidate}) => {
        console.log("ice candidate called");
        socket.to(room).emit("ice-candidate", candidate);
    });

    socket.on('disconnect', () => {
        console.log("user disconnected: " + socket.id);
    })
})

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});
