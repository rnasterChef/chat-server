import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import messageRoutes from "./routes/messages";
import { requireAuth } from "./middlewares/auth";

export const app = express();

// ✅ 쿠키 기반 인증이면 credentials: true 필수
app.use(
  cors({
    origin: true, // 필요하면 프론트 도메인으로 고정: ["http://localhost:19006", ...]
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ 인증 테스트용 (쿠키의 JWT가 검증되면 userId 반환)
app.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.user!.userId });
});

// 기존 라우트 유지
app.use(messageRoutes);