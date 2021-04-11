(function () {
    window.addEventListener("load", init);

    function init() {
        const socket = io();
        let interests = new Set();
        let partnerID = null;
        let submitBtn = document.getElementById("submitInterests");
        submitBtn.addEventListener("click", () => {
                let text = document.getElementById("addInterests").value;
                if (text.length > 20 || text.length === 0) {
                    alert("Text cannot be empty or more than 20 characters long");
                } else {
                    if (interests.size === 10) {
                        alert("Max interests reached");
                    } else {
                        if (interests.has(text.toLowerCase())) {
                            alert("Interest Already Exists");
                        } else {
                            interests.add(text.toLowerCase());
                            let interestView = document.getElementById("interestView");
                            let newInterest = document.createElement("div");
                            newInterest.className = "tag";
                            newInterest.textContent = text;
                            interestView.appendChild(newInterest);
                        }
                    }
                }
            }
        );
        let connectBtn = document.getElementById("connect");
        connectBtn.addEventListener('click', () => {
            if (interests.size === 0) {
                alert("Put some interests!");
            } else {
                let tagBox = document.getElementById("centerElement");
                tagBox.classList.toggle("hidden");
                let btn = document.getElementById("connectBtn");
                btn.classList.toggle("hidden");
                let queue = document.getElementById("queue");
                document.getElementById("exit").classList.toggle("hidden");
                queue.classList.toggle("hidden");
                socket.emit("submitted", Array.from(interests));
            }
        });
        socket.on("EnableChat", (friendId, commonInterests) => {
            let strInterests = "";
            for (let i = 0; i < commonInterests.length; i++) {
                if (i === 0) {
                    strInterests += commonInterests[0];
                } else {
                    strInterests += ", " + commonInterests[i];
                }
            }
            socket.emit("setID", (friendId));
            document.getElementById("queue").classList.toggle("hidden");
            document.getElementById("chatView").classList.toggle("hidden");
            addMessage("You both have the following common interests: " + strInterests);
            partnerID = friendId;
        });

        function addMessage(message) {
            let messageBox = document.createElement("div");
            messageBox.textContent = message;
            messageBox.classList.toggle("theirMessage");
            document.getElementById("chatMessages").append(messageBox);
            document.getElementById("chatMessages").append(document.createElement("br"));
        }

        socket.on("receivePrivateMessage", (message) => {
            addMessage(message);
        });
        document.getElementById("chatText").addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                let message = document.getElementById("chatText").value;
                if (/\S/.test(message)) {
                    document.getElementById("chatText").value = ""
                    let messageBox = document.createElement("div");
                    messageBox.textContent = message;
                    messageBox.classList.toggle("myMessage");
                    document.getElementById("chatMessages").append(messageBox);
                    document.getElementById("chatMessages").append(document.createElement("br"));
                    socket.emit("sendPrivateMessage", partnerID, message);
                    let chatContainer = document.getElementById("chatContainer");
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

            }
        });
        socket.on("endChat", () => {
            alert("ChatMode exited. Enter your tags again!");
            document.getElementById("centerElement").classList.toggle("hidden");
            let interestView = document.getElementById("interestView");
            while (interestView.firstChild) {
                interestView.removeChild(interestView.firstChild);
            }
            let chatMessages = document.getElementById("chatMessages");
            while (chatMessages.firstChild) {
                chatMessages.removeChild(chatMessages.firstChild);
            }
            let btn = document.getElementById("connectBtn");
            document.getElementById("connectBtn").classList.toggle("hidden");
            document.getElementById("exit").classList.toggle("hidden");
            if (document.getElementById("queue").classList.contains("hidden") === false) {
                document.getElementById("queue").classList.toggle("hidden");
            }
            if (document.getElementById("chatView").classList.contains("hidden") === false) {
                document.getElementById("chatView").classList.toggle("hidden");
            }
            interests = new Set();
            partnerID = null;
            socket.emit("setID", null);

        });
        document.getElementById("exit").addEventListener('click', () => {
            socket.emit("leave",);
        });


    }
})();

