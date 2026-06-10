
require('dotenv').config()
const express = require('express')
const http = require("http")
const {Server} = require("socket.io")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin:"*", methods:['GET']}});

const PORT = process.env.PORT ?? "5000";

function isRoomOccupied(roomName){
    const room = io.sockets.adapter.rooms.get(roomName);
    return room && room.size > 0;
}

app.get("/", (req, res) => {
    res.send("Test is working");
})

io.on('connection', socket => {
    console.log("user connected: " + socket.id);

    socket.on('createRoom', room => {
        console.log("Room created: " + room + " by: " + socket.id);
        if(isRoomOccupied(room)){
            console.log(`Error: cant create room: ${room}, room already exits`);
            socket.emit("response", {type:"roomNotCreated"});
        }
        else{
            socket.join(room);
            socket.emit("response", {type:"roomCreated"});
        } 
    })
    socket.on('joinRoom', room => {
        console.log(`Room joined, room: ${room} by ${socket.id}`);
        if(!isRoomOccupied(room)){
            console.log(`Error: cant join room: ${room}, room doesnt exits.`)
            socket.emit("response", {type:"roomNotJoined"});
        }
        else{
            socket.join(room);
            socket.emit("response", {type:"roomJoined"});

        }
    })
    socket.on('userJoinedNotify', ({room, userName}) =>{
        console.log("Notify user joined to Room creator, room:" + room);
        socket.to(room).emit("userJoined", {otherUser:userName});

    })

    socket.on('leaveRoom', room => {
        console.log(`Leaving room: ${room}. User: ${socket.id}`)
        socket.to(room).emit("response", {type: "leaveRoom"});
        socket.leave(room);
        // maybe to emit to other user in room. force disconnect by other too
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
