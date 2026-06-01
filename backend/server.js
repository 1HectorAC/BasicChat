
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
    

    io.on('disconnect', () => {
        console.log("user disconnected: " + socket.id);
    })
})

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});
