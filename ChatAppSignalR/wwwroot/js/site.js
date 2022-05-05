"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

const connBtn = document.getElementById("connectBtn");
const disBtn = document.getElementById("disconnectBtn");
const messageBtn = document.getElementById("sendBtn");

const nameInput = document.getElementById("usernameInput");
const groupNamePara = document.getElementById("groupName");
const messageInput = document.getElementById("messageVal");
const groupTbl = document.getElementById("groupNameTable");

const buttonString = '<button type="submit" class="btn btn-primary joinGroupFromListBtn">Join</button>';

let groupJoinBtnCollection;

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
        //joinSpecificGroupBtn.disabled = false;
    }
})

disBtn.addEventListener('click', async () => {
    await connection.invoke("LeaveRoom", groupNamePara.innerText);
    console.log("User left room");
    disBtn.disabled = true;
    connBtn.disabled = false;
    messageBtn.disabled = true;
    nameInput.disabled = false;
    joinSpecificGroupBtn.disabled = false;
})


messageBtn.addEventListener('click', () => {
    connection.invoke("SendToGroup", messageInput.value, userName, roomName)
})
async function updateGroups() {
    let groupsJson = JSON.parse(await connection.invoke("GetGroupNamesAndCapacity"));
    let index = 1;

    groupTbl.querySelector("tbody").innerHTML = "";

    for (const [key, value] of Object.entries(groupsJson)) {

        const tblRow = document.createElement("tr");
        tblRow.appendChild(document.createElement("td"));
        tblRow.appendChild(document.createElement("td"));
        tblRow.appendChild(document.createElement("td"));
        tblRow.appendChild(document.createElement("td"));


        tblRow.firstChild.textContent = index++;
        tblRow.children[1].textContent = key;
        tblRow.children[2].textContent = `${value}/2`;
        tblRow.lastChild.innerHTML = buttonString;

        groupTbl.querySelector("tbody").appendChild(tblRow);
    }

    groupJoinBtnCollection = document.getElementsByClassName("joinGroupFromListBtn");
    var groupJoinBtnArray = [...groupJoinBtnCollection];

    groupJoinBtnArray.forEach(btn => {
        btn.addEventListener('click', async function () {
            roomName = btn.parentElement.previousElementSibling.previousElementSibling.textContent;
            const result = await connection.invoke("JoinRoom", roomName);
            debugger;
            if (result  == "failed") {
                alert("Room full");
            }
            else {
                userName = nameInput.value;
                connBtn.disabled = true;
                disBtn.disabled = false;
                messageBtn.disabled = false;
                nameInput.disabled = true;
            }
        })
    })

    console.log("Updated group list")
}