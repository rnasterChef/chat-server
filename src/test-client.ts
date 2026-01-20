import "dotenv/config";
import { io } from "socket.io-client";

const SERVER = process.env.TEST_SERVER ?? "http://localhost:3000";

const INLINE_TOKEN = "PASTE_JWT_HERE";
const TOKEN = (process.env.TEST_JWT ?? INLINE_TOKEN).trim();

function assertJwtFormat(token: string) {
  if (!token || token === "PASTE_JWT_HERE") {
    console.error("Missing JWT. Set TEST_JWT or fill INLINE_TOKEN.");
    process.exit(1);
  }
  if (token.split(".").length !== 3) {
    console.error("Invalid JWT format. Expected 3 parts separated by '.'");
    process.exit(1);
  }
}

assertJwtFormat(TOKEN);

const socket = io(SERVER, {
  auth: { token: TOKEN },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("connected", socket.id);

  const roomId = "test-room";
  socket.emit("room:join", { roomId });

  setTimeout(() => {
    socket.emit("chat:send", { roomId, content: "hello jwt socket" });
  }, 300);
});

socket.on("room:joined", (data) => console.log("room:joined", data));
socket.on("chat:new", (msg) => console.log("chat:new", msg));
socket.on("chat:error", (e) => console.log("chat:error", e));

socket.on("connect_error", (err) => {
  console.log("connect_error:", err.message);
});
