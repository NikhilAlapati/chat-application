// Dependencies
const express = require("express");
const app = express();
const socketIo = require("socket.io");
const server = app.listen(process.env.PORT || 5000);
app.use(express.static("public"));
const io = socketIo(server);
// Queue to keep track of the people waiting
let queue = new Map();
// Runs when a user is connected
io.on("connection", socket => {
    // Id for the other user in the chat
    let friendId = null;
    // Send by the client when submitted their interests
    socket.on("submitted", (interests) => {
        let bestMatchingScore = 0;
        for (let [key, value] of queue) {
            let currScore = 0;
            for (let interest in interests) {
                if (value.has(interest)) {
                    currScore++;
                }
            }
            bestMatchingScore = Math.max(bestMatchingScore, currScore);
        }
        for (let [key, value] of queue) {
            let currScore = 0;
            for (let value in interests) {
                if (value.has(interest)) {
                    currScore++;
                }
            }
            if (currScore === bestMatchingScore) {
                friendId = key;
                queue.delete(key);
                break;
            }
        }
        //this is only reachable when the queue is 0(no match is found)
        let currentId = socket.id;
        if (friendId === null) {
            queue.set(currentId, interests);
        } else {
            io.to(currentId).emit("EnableChat", friendId);
            io.to(friendId).emit("EnableChat", currentId);
        }
    });
    socket.on("sendPrivateMessage", (id, message) => {
        io.to(id).emit("receivePrivateMessage", message);
    });
    socket.on("disconnect", () => {
        io.to(friendId).emit("endChat");
    });
});