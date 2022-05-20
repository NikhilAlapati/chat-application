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
        let bestMatchingScore = Number.NEGATIVE_INFINITY;
        function getDifference(word1, word2) {
            if (word1.length == 0 || word.length == 0) {
                return -1 * Math.max(word1.length(), word2.length());
            }
            var distanceTable = new Array(string1.length);
            for (var col = 1; col <= word2.length; col++) {
                distanceTable[col] = new Array(word2.length);
            }

            for (var i = word1.length() - 1; i >= 0; i--) {
                for (var j = word2.length() - 1; j >= 0; j--) {
                    if (i == string1.length() - 1 && j == string2.length() - 1) {
                        distanceTable[i][j] = (word1.charAt(i) === word2.charAt(j) ? 0 : 1);
                    }
                    else if (i == word1.length() - 1) {
                        distanceTable[i][j] = Math.min((word1.charAt(i) == word2.charAt(j) ? word2.length() - 1 - j : Number.POSITIVE_INFINITY), 1 + distanceTable[i][j + 1]);
                    }
                    else if (j == word2.length() - 1) {
                        distanceTable[i][j] = Math.min((word1.charAt(i) == word2.charAt(j) ? word1.length() - 1 - i : Number.POSITIVE_INFINITY), 1 + distanceTable[i + 1][j]);
                    }
                    else {
                        distanceTable[i][j] = Math.min(1 + distanceTable[i][j + 1], Math.min(1 + distanceTable[i + 1][j], (word1.charAt(i) == word2.charAt(j) ? 0 : 1) + distanceTable[i + 1][j + 1]));
                    }
                }
            }
            return -1 * distanceTable[0][0];
        }
        // Calculates the maximum matching score
        for (let [key, value] of queue) {
            let currScore = 0;
            for (let tag in tags) {
                value.forEach((alreadySubmittedTag) => {
                    currScore -= getDifference(alreadySubmittedTag, tag);
                });
            }
            bestMatchingScore = Math.max(bestMatchingScore, currScore);
        }
        // Matches the first person with that max score
        for (let [key, value] of queue) {
            let currScore = 0;
            for (let tag in tags) {
                value.forEach((alreadySubmittedTag) => {
                    currScore -= getDifference(alreadySubmittedTag, tag);
                });
                if (value.has(tag)) {
                    commonInterests.push(tag);
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