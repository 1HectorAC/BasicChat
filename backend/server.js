
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
    socket.on('joinRoom', ({room, name}) => {
        console.log("Room joined: " + room + " by: " + socket.id);
        // add check if room already exits, should
        socket.join(room);
        socket.to(room).emit("userJoined", name);
    })


    io.on('ice-candidate', ({room, candidate}) => {
        console.log("ice candidate called");
        socket.to(room).emit("ice-candidate", candidate);
    });

    io.on('disconnect', () => {
        console.log("user disconnected: " + socket.id);
    })
})

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});
