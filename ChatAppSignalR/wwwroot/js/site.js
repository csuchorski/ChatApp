"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

function start() {
    try {
        connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.on("ReceiveMessage", function (message) {
    let messageRow = document.createElement("tr");
    messageRow.appendChild(document.createElement("td"));
    messageRow.appendChild(document.createElement("td"));

    messageRow.firstChild.textContent = nameInput.value;
    messageRow.lastChild.textContent = message;

    messageList.appendChild(messageRow);
})

start();

//connection.invoke("SendToAllUsers", "Welcome all!");