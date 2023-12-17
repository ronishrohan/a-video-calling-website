let isLoading = true;
let mx = "50%";
let my = "50%";
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

gsap.registerPlugin(TextPlugin);

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
      leavePageAnimation();
      setTimeout(() => {
        window.location = `room.html?room=${roomCode}`;
      }, 200);
      
    }
    if (type === "create") {
      roomCode = String(Math.floor(Math.random() * 10000));
      leavePageAnimation();
      setTimeout(() => {
        window.location = `room.html?room=${roomCode}`;
      }, 200);
    }
  }
}

function leavePageAnimation(){
  gsap.to("#unloading", {
    height: "100%",
    ease: "power1.out",
    duration:0.2
  })
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

document.addEventListener("DOMContentLoaded", () => {
  
  gsap.to("#loading p", {
    transform: "translateY(0)",
    opacity: 1,
    
    duration: 1
  })
  gsap.to("#loading p", {
    duration :2,
    delay: 1,
    fontSize: "24px",
    ease: "expo,out",
    text: "done, move mouse to enter.",
  
    color: "#9829ff",
    backgroundColor: "transparent",
    
    onComplete: setIsLoading
  })
  
});


document.addEventListener("mousemove", (e) => {
  if(!isLoading)
  {
    mx = e.clientX;
    my = e.clientY;
    gsap.to("#loading ",{
      clipPath: `circle(0% at ${mx}px ${my}px)`,
      duration : 0.5,
      onComplete: removeLoading
    });
  }
  
})

function setIsLoading(){
  isLoading = false;
}

function removeLoading(){
  
  setTimeout(() => {
    document.getElementById('loading').style.display = "none";
  }, 200);
  
}

window.addEventListener("beforeunload", () => {
  console.log("LEFT");
  alert("leaving");
  
});