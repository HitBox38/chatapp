const { Server } = require("socket.io");

const users = {};

const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    io.emit("user-connected", {
      newUser: name,
      users,
    });
    console.log(users);
  });

  socket.on("send-chat-message", (message) => {
    socket.broadcast.emit("chat-message", { message: message, name: users[socket.id] });
  });

  socket.on("disconnect", () => {
    const oldUser = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit("user-disconnected", {
      oldUser,
      users,
    });
    console.log(users);
  });
});

console.log("running on port 3000");
