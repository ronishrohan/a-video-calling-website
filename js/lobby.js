let inputButton = document.getElementById("name-input-box");
let displayName = sessionStorage.getItem("displayName");
if (displayName) {
  inputButton.value = displayName;
}

let joinButton = document.getElementById("join-room");
let createButton = document.getElementById("create-room");

joinButton.addEventListener("click", () => {
  handleRoomConnection("join");
});
createButton.addEventListener("click", () => {
  handleRoomConnection("create");
});

function handleRoomConnection(type) {
  let updatedName = inputButton.value;
  if (!updatedName) {
    alert("you need to enter a valid name");
  } else {
    sessionStorage.setItem("displayName", updatedName);
    sessionStorage.setItem("user-name", updatedName);
    console.log(type);
    if (type === "join") {
      roomCode = prompt("Enter room code:");
      if (!roomCode) {
        roomcode = askPromptAgain();
      }
      window.location = `room.html?room=${roomCode}`;
    }
    if (type === "create") {
      roomCode = String(Math.floor(Math.random() * 10000));
      window.location = `room.html?room=${roomCode}`;
    }
  }
}
function askPromptAgain() {
  newCode = prompt("A room code is required to join a room!");
  if (!newCode) {
    askPromptAgain();
  } else {
    return newCode;
  }
}

function joinRoom() {}

function createRoom() {}
