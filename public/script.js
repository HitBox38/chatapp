const socket = io("http://localhost:3000");
const messageContainer = document.getElementsByClassName("messages")[0];
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const participantsElement = document.getElementById("users");
const exitButton = document.getElementById("exit-chat");
let activeChat = [];

const messageFormatter = (message) => {
  return message
    .replace(/(?:\*)(?:(?!\s))((?:(?!\*|\n).)+)(?:\*)/g, "<b>$1</b>")
    .replace(/(?:_)(?:(?!\s))((?:(?!\n|_).)+)(?:_)/g, "<i>$1</i>")
    .replace(/(?:~)(?:(?!\s))((?:(?!\n|~).)+)(?:~)/g, "<s>$1</s>")
    .replace(/(?:--)(?:(?!\s))((?:(?!\n|--).)+)(?:--)/g, "<u>$1</u>");
};

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

let chat = getCookie("chat");

const appendMessage = (sender, message, className) => {
  const messageElement = document.createElement("div");
  if (className === "update") {
    messageElement.className = className;
    messageElement.innerText = sender + message;
  } else {
    message = messageFormatter(message);
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
  activeChat.push({ sender, message, className });
  setCookie("chat", JSON.stringify(activeChat), 365);
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

if (user === "") {
  const userName = prompt("What is your name?");
  appendMessage(`You (${userName})`, " joined", "update");
  document.cookie = `username=${userName}`;
  socket.emit("new-user", userName);
} else {
  if (chat !== "") {
    activeChat = JSON.parse(chat);
    activeChat.map((message) => {
      console.log(message);
      appendMessage(message.sender, message.message, message.className);
    });
  }
  appendMessage(`You (${user})`, " joined", "update");
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
  setCookie("chat", chat, -15);
  socket.emit("user-disconnected");
  window.location.reload();
});
