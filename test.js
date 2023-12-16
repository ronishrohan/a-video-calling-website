
const data = {
    channelname: "hahsh",
    uid: "hhh",
    role: "publisher",
  };
url = "https://asgajsgjasg.azurewebsites.net/generate-token"
fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify(data),
}).then((response) => response.json());