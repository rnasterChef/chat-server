const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: { userId: "test-user" },
});

const roomId = "test-room";

socket.on("connect", () => {
  console.log("connected", socket.id);
  socket.emit("room:join", { roomId });

  setTimeout(() => {
    socket.emit("chat:send", {
      roomId,
      content: "hello websocket",
    });
  }, 300);
});

socket.on("chat:new", (msg: any) => {
  console.log("chat:new", msg);
});

socket.on("chat:error", (e: any) => {
  console.log("chat:error", e);
});