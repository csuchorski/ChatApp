"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

const connBtn = document.getElementById("connectBtn");
const disBtn = document.getElementById("disconnectBtn");
const messageBtn = document.getElementById("sendBtn");

const nameInput = document.getElementById("usernameInput");
const groupNamePara = document.getElementById("groupName");
const messageInput = document.getElementById("messageVal");
const groupTbl = document.getElementById("groupNameTable");

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

setInterval(updateGroups, 5000);

connBtn.addEventListener('click', async () => {
    if (nameInput.value.length < 3) {
        alert("Username must be at least 3 characters")
    }
    else {
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
    }
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
async function updateGroups() {
    let groupNames = JSON.parse(await connection.invoke("GetGroupNames"));
    console.log(groupNames);
    const tblRow = document.createElement("tr");
    tblRow.appendChild(document.createElement("td"));
    tblRow.appendChild(document.createElement("td"));

    let index = 1;

    groupTbl.querySelector("tbody").innerHTML = "";

    groupNames.forEach(groupName => {
        tblRow.firstChild.textContent = index++;
        tblRow.lastChild.textContent = groupName;
        groupTbl.querySelector("tbody").appendChild(tblRow);
    })
    console.log("Updated group list")
}