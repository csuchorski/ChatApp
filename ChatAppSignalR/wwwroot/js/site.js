"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

const connBtn = document.getElementById("connectBtn");
const disBtn = document.getElementById("disconnectBtn");
const messageBtn = document.getElementById("sendBtn");

const nameInput = document.getElementById("usernameInput");
const groupNamePara = document.getElementById("groupName");
const messageInput = document.getElementById("messageVal");

let userName;
let roomName;

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

connBtn.addEventListener('click', async () => {
    userName = nameInput.value;
    roomName = await connection.invoke("FindRoom");
    console.log(roomName)
    if (roomName == "roomNull") {
        await connection.invoke("JoinRoom", userName)
            .then(groupNamePara.innerText = userName);
        roomName = userName;
    }
    else {
        await connection.invoke("JoinRoom", roomName)
            .then(groupNamePara.innerText = roomName);
    }
    connBtn.disabled = true;
    disBtn.disabled = false;
    messageBtn.disabled = false;
    nameInput.disabled = true;
})

disBtn.addEventListener('click', async () => {
    await connection.invoke("LeaveRoom", groupNamePara.innerText);
    console.log("User left room");
    disBtn.disabled = true;
    connBtn.disabled = false;
    messageBtn.disabled = true;
    nameInput.disabled = false;
})


messageBtn.addEventListener('click', () => {
    connection.invoke("SendToGroup", messageInput.value, userName, roomName)
})

