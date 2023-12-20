import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  child,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgwOR8sni-By5hZ1FpKJXNpseOYj5PjDY",
  authDomain: "project-demo-cfe52.firebaseapp.com",
  projectId: "project-demo-cfe52",
  storageBucket: "project-demo-cfe52.appspot.com",
  messagingSenderId: "766176251356",
  appId: "1:766176251356:web:45d721966c0d9c53669319",
  measurementId: "G-29HQTR3B7B",
  databaseURL:
    "https://project-demo-cfe52-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const name = sessionStorage.getItem("user-name");
const inputBox = document.getElementById("send-input");
const messagesContainer = document.getElementById("messages-holder");
const database = getDatabase();
const now = new Date();

var messageNotif = new Audio("../assets/notification_high-intensity.wav")

const searchParams = new URLSearchParams(window.location.search);

gsap.ticker.lagSmoothing(0);

let ROOMID = searchParams.get("room");

function sendInput() {
  let isprev = false;
  const message = inputBox.value;
  console.log(message.length);
  if (message.length != 0 && message != "" && message != " ") {
    if (messagesContainer.lastElementChild.id == `message-${name}`) {
      isprev = true;
    }

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let time = "";
    let player = isprev
      ? `<div class="messages-wrapper" id="message-${name}" >
                    
                    <p class="player-message">${message}</p>
                  </div>`
      : `<div class="messages-wrapper" id="message-${name}" >
      <p class="player-message-title">${name}(you)<span class="message-time" >${
          hours > 9 ? hours : "0" + hours
        }:${minutes > 9 ? minutes : "0" + minutes}</span></p>
      <p class="player-message">${message}</p>
    </div>`;
    document
      .getElementById("messages-holder")
      .insertAdjacentHTML("beforeend", player);
    document.getElementById(`message-${name}`).scrollIntoView();

    time = `${hours > 9 ? hours : "0" + hours}:${
      minutes > 9 ? minutes : "0" + minutes
    }`;

    const id = push(child(ref(database), "messages")).key;

    set(ref(database, `messages/${ROOMID}/${id}`), {
      name: name,
      message: message,
      time: time,
    });

    inputBox.value = "";
  }
}

document.getElementById("send-button").addEventListener("click", () => {
  sendInput();
});

const inMessage = ref(database, `messages/${ROOMID}/`);
onChildAdded(inMessage, (data) => {
  if (data.val().name != name) {
    messageNotif.play();
    let isprev = false;
    
    let indata = data.val();
    if (messagesContainer.lastElementChild.id == `message-${indata.name}`) {
      isprev = true;
    }
    let player = isprev ? 
    `<div class="messages-wrapper" id="message-${indata.name}" >
    
    <p class="player-message">${indata.message}</p>
  </div>`
    :
    `<div class="messages-wrapper" id="message-${indata.name}" >
    <p class="player-message-title">${indata.name}<span class="message-time" >${indata.time}</span></p>
    <p class="player-message">${indata.message}</p>
  </div>`
    ;
    document
      .getElementById("messages-holder")
      .insertAdjacentHTML("beforeend", player);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let participant = `<div class="participant" >
  <p>${name}(you)</p>
</div>`
  document.getElementById("member-list").insertAdjacentHTML("beforeend", participant);
})

document.getElementById("chat-container").addEventListener("keypress", (e) => {
  if(e.key == "Enter"){
    sendInput();
  }
})
