const socket = io("http://localhost:3000");
const messageContainer = document.getElementsByClassName("messages")[0];
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const participantsElement = document.getElementById("users");
const exitButton = document.getElementById("exit-chat");

const getCookie = (cname) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

const setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

let user = getCookie("username");

console.log(user);
const appendMessage = (sender, message, className) => {
  const messageElement = document.createElement("div");
  if (className === "update") {
    messageElement.className = className;
    messageElement.innerText = sender + message;
  } else {
    messageElement.className = `message ${className}`;
    const nameElement = document.createElement("div");
    const textElement = document.createElement("div");
    nameElement.className = "name";
    nameElement.innerText = sender;
    textElement.className = "text";
    textElement.innerHTML = message;
    messageElement.appendChild(nameElement);
    messageElement.appendChild(textElement);
  }
  messageContainer.append(messageElement);
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

if (user === "") {
  const userName = prompt("What is your name?");
  appendMessage(`You (${userName})`, " joined", "update");
  document.cookie = `username=${userName}`;
  socket.emit("new-user", userName);
} else {
  appendMessage(`You (${user})`, " joined", "update");
  document.cookie = `username=${user}`;
  socket.emit("new-user", user);
}

socket.on("chat-message", (data) => {
  appendMessage(data.name, `${data.message}`, "other-message");
});

socket.on("user-connected", ({ newUser, users }) => {
  participantsElement.innerText = "Online: " + Object.values(users).join(", ");
  if (newUser !== user) {
    appendMessage(newUser, " connected", "update");
  }
});

socket.on("user-disconnected", ({ oldUser, users }) => {
  participantsElement.innerText = "Online: " + Object.values(users).join(", ");
  appendMessage(oldUser, " disconnected", "update");
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage("you", message, "my-message");
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

exitButton.addEventListener("click", () => {
  setCookie("username", user, -15);
  socket.emit("user-disconnected");
  window.location.reload();
});
