
let TOKEN;

var client;

let cameraOn = false;
let micOn = false;

const url = "https://asgajsgjasg.azurewebsites.net/generate-token";
const data = {
  channelname: null,
  uid: null,
  role: "publisher",
};

const APPID = "df5cbc837ccb4ff1accd5ccecc512fba";

var localTracks = {
  videoTrack: null,
  audioTrack: null,
};

var remoteUsers = {};

var participants = [];



name = window.sessionStorage.getItem("user-name");
console.log(name);


const searchParams = new URLSearchParams(window.location.search);

let ROOMID = searchParams.get("room");

data.channelname = ROOMID;
data.uid = name;

gsap.registerPlugin(TextPlugin);
gsap.ticker.lagSmoothing(0);

async function getToken() {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

async function setToken() {
  TOKEN = await getToken();
}

document.getElementsByClassName("title")[0].textContent = name;
participants.push(name);
var options = {
  appid: APPID,
  channel: ROOMID,
  uid: null,
  token: TOKEN,
};

if (options.uid === null) {
  options.uid = generateUid();
  console.log(`Set uid to ${options.uid}`);
}

function generateUid() {
  uid = Math.floor(Math.random() * 1000000);
  return `${name}__${uid}`;
}

var videoConfig = {
  label: "480p_1",
  detail: "640×480, 15fps, 500Kbps",
  value: "480p_1",
};

async function initDevices() {
  
    if (!localTracks.audioTrack) {
      localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "music_standard",
      });
    }
    if (!localTracks.videoTrack) {
      localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: videoConfig.value,
      });
    }
  
}

async function join() {
  await setToken();
  console.log(TOKEN);
  client.on("user-published", async (user, mediaType) =>
    handleUserPublished(user, mediaType)
  );
  client.on("user-unpublished", handleUserUnpublished);

  client.on("userOffline", (uid, reason) => {
    console.log("LEFTLEFTLEFTLEFT" + uid);
    delete remoteUsers[uid];
    let player = `remote-stream-${uid}`;
    document.getElementById(player).remove();
  });

  options.uid = await client.join(options.appid, ROOMID, TOKEN.token, name);

  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard",
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: videoConfig.value,
    });
  }

  localTracks.videoTrack.play("local-player");

  await client.publish(Object.values(localTracks));
  console.log("Publish success");
}

async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  remoteUsers = {};

  await client.leave();
  console.log("Client left the channel succesfully");
  transitionAnimationOut();
  setTimeout(() => {
    window.location = "index.html";
  }, 200);
}

async function subscribe(user, mediaType, userID) {
  const uid = user.uid;
  console.log(`mediatype = ${mediaType}`);
  await client.subscribe(user, mediaType);
  console.log("Subscribe success");
  userName = String(uid);
  if (mediaType === "video") {
    const player = `<div class="video-container" id="remote-stream-${userID}">
                            <div id="player-${userID}" class="player" ></div>
                            <h1 id="user-name" class="title-smaller" >${userName}</h1>
                        </div>`;
    document
      .getElementById("remote-streams-container")
      .insertAdjacentHTML("beforeend", player);
    user.videoTrack.play(`player-${userID}`);
    sendBotMessage(`${uid} joined the room`);

    handleElementsUserSubscribed(userName);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
  const inName = String(uid);
  console.log("COOOOOOOOOOOOOOOOO" + inName);
  if (!participants.includes(inName)) {
    participants.push(inName);
    let participant = `<div class="participant" id="participant-${inName}" >
    <p>${inName}</p>
    </div>`
    document.getElementById("member-list").insertAdjacentHTML("beforeend", participant);
  }
  document.getElementById("participant-count").textContent =
    participants.length;
  
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;

  subscribe(user, mediaType, id);
}

function handleUserUnpublished(user, mediatype) {
  if (mediatype === "video") {
    
    const id = user.uid;
    delete remoteUsers[id];
    document.getElementById(`remote-stream-${id}`).remove();
    document.getElementById(`participant-${id}`).remove();
    delete participants[participants.indexOf(id)];
    let prevPart = participants;
    participants = prevPart.filter(n=>n);
    document.getElementById("participant-count").textContent = participants.length;

  }
}

document.addEventListener("DOMContentLoaded", async function () {
  client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp9",
  });
  await join();
});

document
  .getElementById("leave-button")
  .addEventListener("click", async function () {
    await leave();
  });

function handleElementsUserSubscribed(participant) {
  document.getElementById("participant-count").value = participants.length;
}

document.getElementById("add-participant").addEventListener("click", () => {
  console.log("CLICKed");
  navigator.clipboard.writeText(ROOMID);
  //alert(`Room id: ${ROOMID} copied to your clipboard`);
});
document.getElementById("add-participant").addEventListener("mousedown", () => {
  document.getElementById("add-participant").textContent = "copied";
});

document.getElementById("add-participant").addEventListener("mouseover", () => {
  document.getElementById("add-participant").textContent = "invite";
});
document.getElementById("add-participant").addEventListener("mouseout", () => {
  document.getElementById("add-participant").textContent = "+";
});

document.getElementById("camera-toggle").addEventListener("click", () => {
  cameraOn = !cameraOn;
  localTracks.videoTrack.setMuted(cameraOn);
  
  document.getElementById("camera-toggle").innerHTML= (!cameraOn ? 
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
    :
    `<svg id="disabled" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.7071 4.70711C21.0976 4.31658 21.0976 3.68342 20.7071 3.29289C20.3166 2.90237 19.6834 2.90237 19.2929 3.29289L3.29289 19.2929C2.90237 19.6834 2.90237 20.3166 3.29289 20.7071C3.68342 21.0976 4.31658 21.0976 4.70711 20.7071L20.7071 4.70711Z" fill="#000000"/>
    <path d="M13 5C13.8933 5 14.7181 5.29281 15.3839 5.78768L13.9383 7.2333C13.6585 7.08438 13.3391 7 13 7H6C4.89543 7 4 7.89543 4 9V15C4 15.5959 4.26065 16.131 4.67416 16.4974L3.25865 17.9129C2.48379 17.1834 2 16.1482 2 15V9C2 6.79086 3.79086 5 6 5H13Z" fill="#000000"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 17H9.82843L7.82843 19H13C15.0938 19 16.8118 17.3913 16.9855 15.3425L20.306 16.8424C21.1003 17.2012 22 16.6203 22 15.7488V8.27144C22 7.34868 21.0019 6.77121 20.202 7.23108L18.7799 8.04856L15 11.8284V15C15 16.1046 14.1046 17 13 17ZM17 13.1544L20 14.5096V9.65407L17 11.3786V13.1544Z" fill="#000000"/>
    </svg>`
    );
  gsap.to("#video-off", {
    opacity : (cameraOn ? 1 : 0),
    duration: 0.4
  })
});

document.getElementById("mic-toggle").addEventListener("click", () => {
  micOn = !micOn;
  localTracks.audioTrack.setMuted(micOn);

  document.getElementById("mic-toggle").innerHTML = (!micOn ?
    `<svg width="24" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5C8 2.79086 9.79086 1 12 1C14.2091 1 16 2.79086 16 5V12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12V5Z" fill="#000000"/>
    <path d="M6.25 11.8438V12C6.25 13.525 6.8558 14.9875 7.93414 16.0659C9.01247 17.1442 10.475 17.75 12 17.75C13.525 17.75 14.9875 17.1442 16.0659 16.0659C17.1442 14.9875 17.75 13.525 17.75 12V11.8438C17.75 11.2915 18.1977 10.8438 18.75 10.8438H19.25C19.8023 10.8438 20.25 11.2915 20.25 11.8437V12C20.25 14.188 19.3808 16.2865 17.8336 17.8336C16.5842 19.0831 14.9753 19.8903 13.25 20.1548V22C13.25 22.5523 12.8023 23 12.25 23H11.75C11.1977 23 10.75 22.5523 10.75 22V20.1548C9.02471 19.8903 7.41579 19.0831 6.16637 17.8336C4.61919 16.2865 3.75 14.188 3.75 12V11.8438C3.75 11.2915 4.19772 10.8438 4.75 10.8438H5.25C5.80228 10.8438 6.25 11.2915 6.25 11.8438Z" fill="#000000"/>
    </svg>`
    :
    `<svg id="disabled" width="24" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1C13.6452 1 15.0585 1.99333 15.6728 3.41298L7.99997 11.0858V5C7.99997 2.79086 9.79083 1 12 1Z" fill="#000000"/>
    <path d="M6.24997 12C6.24997 12.2632 6.26801 12.5245 6.30342 12.7823L4.25194 14.8338C3.92295 13.9344 3.74997 12.9761 3.74997 12V11.8438C3.74997 11.2915 4.19769 10.8438 4.74997 10.8438H5.24997C5.80226 10.8438 6.24997 11.2915 6.24997 11.8438V12Z" fill="#000000"/>
    <path d="M7.3242 18.7971L3.76773 22.3535C3.3772 22.7441 2.74404 22.7441 2.35352 22.3535L1.64641 21.6464C1.25588 21.2559 1.25588 20.6227 1.64641 20.2322L20.2322 1.64644C20.6227 1.25591 21.2559 1.25591 21.6464 1.64644L22.3535 2.35354C22.744 2.74407 22.744 3.37723 22.3535 3.76776L16 10.1213V12C16 14.2091 14.2091 16 12 16C11.4457 16 10.9177 15.8873 10.4378 15.6835L9.13553 16.9857C9.99969 17.4822 10.986 17.75 12 17.75C13.525 17.75 14.9875 17.1442 16.0658 16.0659C17.1442 14.9875 17.75 13.525 17.75 12V11.8438C17.75 11.2915 18.1977 10.8438 18.75 10.8438H19.25C19.8023 10.8438 20.25 11.2915 20.25 11.8437V12C20.25 14.188 19.3808 16.2865 17.8336 17.8336C16.5842 19.0831 14.9753 19.8903 13.25 20.1548V23H10.75V20.1548C9.51944 19.9662 8.34812 19.5014 7.3242 18.7971Z" fill="#000000"/>
    </svg>`
    );

});

document.addEventListener("DOMContentLoaded", () => {
  console.log("LOADED");
  setTimeout(() => {
    transitionAnimationIn();
  }, 400);
  sendBotMessage("welcome to the room");
  
});

document.getElementById("create-room-button").addEventListener("click", () => {
  transitionAnimationOut();
  setTimeout(() => {
    window.location = "index.html";
  }, 200);
});

document.getElementById("logo").addEventListener("click", () => {
  transitionAnimationOut();
  setTimeout(() => {
    window.location = "index.html";
  }, 200);
});

function sendBotMessage(message){
  let botMessage = `<div class="message-wrapper">
  <p class="npc-message" ></p>
  </div>`
  document.getElementById("messages-holder").insertAdjacentHTML("beforeend", botMessage)
  let targetElement = Array.from(document.querySelectorAll(".npc-message")).pop()
  gsap.to(targetElement, {
    text: `>${message}`,
    duration: 1.2,
    delay: 1
  })
}

function transitionAnimationOut() {
  document.getElementById("transition").style.top = "auto";
  document.getElementById("transition").style.bottom = "0";

  gsap.to("#transition", {
    height: "100%",
    
    duration: 0.6,
  });
}

function transitionAnimationIn() {
  gsap.to("#transition", {
    height: "0",

    duration: 0.4,
  });
}

function addParticipant(name){
  player = ``;
}