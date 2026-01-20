import { Server } from "socket.io";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { supabase } from "./db";

type AuthedData = {
  userId: string;
};

function mapJwtError(error: unknown): string {
  if (error instanceof TokenExpiredError) return "JWT_EXPIRED";
  if (error instanceof NotBeforeError) return "JWT_NOT_ACTIVE";
  if (error instanceof JsonWebTokenError) {
    if (error.message === "jwt malformed") return "JWT_MALFORMED";
    if (error.message === "invalid signature") return "INVALID_SIGNATURE";
    if (error.message === "jwt signature is required") return "INVALID_SIGNATURE";
    if (error.message === "secret or public key must be provided") {
      return "MISSING_JWT_SECRET";
    }
    return "INVALID_TOKEN";
  }
  return "INVALID_TOKEN";
}

export function setupSocket(io: Server) {
  // ✅ 1) 소켓 연결 전에 JWT 검증
  io.use((socket, next) => {
    try {
      // 프론트가 auth로 token을 보낸다고 가정: io(url, { auth: { token } })
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== "string") {
        return next(new Error("NO_ACCESS_TOKEN"));
      }

      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return next(new Error("MISSING_JWT_SECRET"));
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const userId = String(decoded.sub ?? decoded.userId ?? "");
      if (!userId) return next(new Error("INVALID_TOKEN_PAYLOAD"));

      (socket.data as AuthedData).userId = userId;
      next();
    } catch (e) {
      return next(new Error(mapJwtError(e)));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as AuthedData).userId;
    console.log("socket connected:", socket.id, "user:", userId);

    socket.on("room:join", ({ roomId }) => {
      const rid = String(roomId ?? "");
      if (!rid) return;

      socket.join(rid);
      socket.emit("room:joined", { roomId: rid });
    });

    socket.on("chat:send", async ({ roomId, content }) => {
      const rid = String(roomId ?? "");
      const text = String(content ?? "").trim();

      if (!rid || !text) return;

      // ✅ sender_id는 클라이언트가 보내도 무시하고 서버가 userId로 강제
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
