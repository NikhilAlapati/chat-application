const socket = io();


(function () {
    window.addEventListener("load", init);
    let interests = new Set();

    function init() {
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
                let chatView = document.getElementById("chatView");
                chatView.toggleAttribute("hidden");
                let tagBox=document.getElementById("centerElement");
                tagBox.toggleAttribute("hidden");
                let btn=document.getElementById("connectBtn");
                btn.toggleAttribute("hidden");
            }
        });
    }
})();
