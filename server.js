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
        let candidateId=null;
        /*
        for (let i = 0; i < queue.length; i++) {
            for (let j = 0; j < queue[i].interests.length; i++) {
                if (queue[i][1].contains(interests[i])) {

                }
            }
        }*/
        for(let i=0; i < queue.length;i++){
            let currScore=0;
            for(let j=0; j<queue[1].length;j++){
                if(interests[j]===queue[1][j]){
                    currScore++;
                }
            }
            bestMatchingScore=max(bestMatchingScore, currScore);
        }
        for(let i=0; i<queue.length;i++){
            let currScore=0;
            for(let j=0;j<queue[1].length;j++){
                if(interests[j]===queue[1][j]){
                    currScore++;
                }
            }
            if(currScore==bestMatchingScore){
                candidateId=queue[i][0];
                break;
            }
        }
        //this is only reacheable when the queue is 0(no match is found)
        if(candidateId===null){
            queue.push([socket.id, interests]);
            
        }
    });
});