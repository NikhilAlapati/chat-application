const express = require("express");
const app = express();
const socketIo = require("socket.io");
const server = app.listen(process.argv[2]);
const io = socketIo(server);

let queue = [];
let roomMessages = [];

io.on("connection", socket => {
    io.on("submitted", (interests) => {
        let bestMatchingScore = 0;
        for (let i = 0; i < queue.length; i++) {
            for (let j = 0; j < queue[i].interests.length; i++) {
                if (queue[i][1].contains(interests[i])) {

                }
            }
        }
        queue.push([socket.id, interests]);
    });
});