import { Router } from "express";
import { supabase } from "../db";

const router = Router();

/**
 * GET /rooms/:roomId/messages?limit=50
 * 특정 방의 최근 채팅 메시지 조회
 */
router.get("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, sender_id, content, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data ?? []);
});

export default router;