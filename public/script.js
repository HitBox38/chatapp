const socket = io("http://localhost:3000");
const messageContainer = document.getElementsByClassName("messages")[0];
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

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
};

const userName = prompt("What is your name?");
appendMessage("You", " joined", "update");
socket.emit("new-user", userName);

socket.on("chat-message", (data) => {
  appendMessage(data.name, `${data.message}`, "other-message");
});

socket.on("user-connected", (name) => {
  appendMessage(name, " connected", "update");
});

socket.on("user-disconnected", (name) => {
  appendMessage(name, " disconnected", "update");
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage("you", message, "my-message");
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});
