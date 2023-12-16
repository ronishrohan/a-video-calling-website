let TOKEN;

var client;

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
participants.push(`${name}(you)`);

const searchParams = new URLSearchParams(window.location.search);

let ROOMID = searchParams.get("room");

data.channelname = ROOMID;
data.uid = name;

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
    console.log("LEFTLEFTLEFTLEFT"+  uid);
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
  window.location = "index.html";
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

    handleElementsUserSubscribed(userName);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
  const inName = String(uid);
  console.log("COOOOOOOOOOOOOOOOO" + inName);
  if (!participants.includes(inName)) {
    participants.push(inName);
  }
  document.getElementById("participant-count").textContent =
    participants.length - 1;
  document
    .getElementById("empty-message")
    .style.setProperty("display", "none", "important");
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;

  subscribe(user, mediaType, id);
}

function handleUserUnpublished(user, mediatype) {
  if (mediatype === "video") {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA THANKS"+user.uid);
    const id = user.uid;
    delete remoteUsers[id];
    document.getElementById(`remote-stream-${id}`).remove();
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
  addElm = `<p class="participant">${participant}</p>`;
  document
    .getElementById("member-list")
    .insertAdjacentHTML("beforeend", addElm);
  document.getElementById("participant-count").value = participants.length;
}

document.getElementById("logo").addEventListener("click", () => {
  window.location = "index.html";
});

document.getElementById("add-participant").addEventListener("click", () => {
  console.log("CLICKed");
  navigator.clipboard.writeText(ROOMID);
  //alert(`Room id: ${ROOMID} copied to your clipboard`);
  
  
});
document.getElementById('add-participant').addEventListener("mousedown", () => {
  document.getElementById('add-participant').textContent = "copied"
});

document.getElementById('add-participant').addEventListener("mouseover", () => {
  document.getElementById('add-participant').textContent = "invite";
});
document.getElementById('add-participant').addEventListener("mouseout", () => {
  document.getElementById('add-participant').textContent = "+";
});
