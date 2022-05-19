// Dependencies
const express = require("express");
const app = express();
const socketIo = require("socket.io");
// Creation of server
const server = app.listen(process.env.PORT || 5000);
app.use(express.static("public"));
const io = socketIo(server);
// Queue to keep track of the people waiting
let queue = new Map();
// Runs when a user is connecte
io.on("connection", socket => {
    // Id for the other user in the chat
    let friendId = null;
    // Send by the client when submitted their interests
    socket.on("submitted", (tags) => {
        // Keep track of common interests between 2 users
        let commonInterests = [];
        let interests = new Set(tags);
        let bestMatchingScore = 0;
        // Calculates the maximum matching score
        for (let [key, value] of queue) {
            let currScore = 0;
            for (var it = interests.values(), val = null; val = it.next().value;) {
                if (value.has(val)) {
                    currScore++;
                }
            }
            bestMatchingScore = Math.max(bestMatchingScore, currScore);
        }
        // Matches the first person with that max score
        for (let [key, value] of queue) {
            let currScore = 0;
            for (var it = interests.values(), val = null; val = it.next().value;) {
                if (value.has(val)) {
                    currScore++;
                    commonInterests.push(val);
                }
            }
            if (bestMatchingScore > 0 && currScore === bestMatchingScore) {
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
            // Enables the chat view for both users when a match is found
            io.to(currentId).emit("EnableChat", friendId, commonInterests);
            io.to(friendId).emit("EnableChat", currentId, commonInterests);
        }
    });
    // When an SetID call is received by the server
    socket.on("setID", (ID) => {
        friendId = ID;
    });
    // When send private message is recieved by user it sends to the other users
    socket.on("sendPrivateMessage", (id, message) => {
        io.to(id).emit("receivePrivateMessage", message);
    });
    // When the user wants to leave
    socket.on("leave", () => {
        if (friendId === null) {
            queue.delete(socket.id);
            io.to(socket.id).emit("endChat");
        } else {
            io.to(friendId).emit("endChat");
            io.to(socket.id).emit("endChat");
            friendId = null;
        }
    });
    // Runs when a user disconnects
    socket.on("disconnect", () => {
        if (friendId === null) {
            queue.delete(socket.id);
        } else {
            io.to(friendId).emit("endChat");
        }
    });
});