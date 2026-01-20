import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messages";

export const app = express();

app.use(cors());
app.use(express.json());

// ⭐ 이 줄 중요
app.use(messageRoutes);