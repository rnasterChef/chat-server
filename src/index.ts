import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { setupSocket } from "./socket";
import "dotenv/config";

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

setupSocket(io);

server.listen(Number(process.env.PORT ?? 3000), () => {
  console.log("HTTP server running on", process.env.PORT ?? 3000);
});