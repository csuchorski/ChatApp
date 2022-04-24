"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

const connBtn = document.getElementById("connectBtn");
const messageBtn = document.getElementById("sendBtn");

const nameInput = document.getElementById("usernameInput");
const groupNamePara = document.getElementById("groupName");
const messageInput = document.getElementById("messageVal");

function start() {
    try {
        connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.on("ReceiveMessage", function (message, user) {
    let messageRow = document.createElement("tr");
    messageRow.appendChild(document.createElement("td"));
    messageRow.appendChild(document.createElement("td"));

    messageRow.firstChild.textContent = user;
    messageRow.lastChild.textContent = message;

    messageList.appendChild(messageRow);
})

start();

connBtn.addEventListener('click', () => {
    let userName = nameInput.value;
    let roomName = connection.invoke("FindRoom");
    if (roomName == "roomNull") {
        connection.invoke("JoinRoom", userName);
        groupNamePara.textContent = userName;
    }
    else {
        connection.invoke("JoinRoom", roomName);
        groupNamePara.textContent = roomName;
    }
})

messageBtn.addEventListener('click', () => {
    connection.invoke("SendToGroup", messageInput.value, nameInput.value, groupNamePara.textContent)
})

