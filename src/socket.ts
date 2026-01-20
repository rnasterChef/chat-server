import { Server } from "socket.io";
import { supabase } from "./db";

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    // MVP: 클라이언트가 userId를 auth로 보낸다고 가정
    const userId = socket.handshake.auth?.userId;
    if (!userId) return next(new Error("NO_AUTH"));
    socket.data.userId = String(userId);
    next();
  });

  io.on("connection", (socket) => {
    socket.on("room:join", ({ roomId }) => {
      if (!roomId) return;
      socket.join(String(roomId));
      socket.emit("room:joined", { roomId: String(roomId) });
    });

    socket.on("chat:send", async ({ roomId, content }) => {
      const rid = String(roomId ?? "");
      const text = String(content ?? "").trim();
      const userId = String(socket.data.userId ?? "");

      if (!rid || !text) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .insert({ room_id: rid, sender_id: userId, content: text })
        .select("id, room_id, sender_id, content, created_at")
        .single();

      if (error) {
        socket.emit("chat:error", { message: error.message });
        return;
      }

      io.to(rid).emit("chat:new", data);
    });
  });
}