import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

type AuthedUser = {
  userId: string;
  // 필요하면 roles, email 등 추가
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

// 쿠키 이름은 너희가 쓰는 이름으로 맞추기
const ACCESS_COOKIE = "access_token";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log(
        "[AUTH DEBUG] JWT_ACCESS_SECRET len =",
        (process.env.JWT_ACCESS_SECRET || "").length
    );

  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return res.status(401).json({ message: "NO_ACCESS_TOKEN" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    // payload에 뭐가 들어있는지(예: sub, userId) 팀 규격에 맞추기
    const userId = String(decoded.sub ?? decoded.userId ?? "");
    if (!userId) return res.status(401).json({ message: "INVALID_TOKEN_PAYLOAD" });

    req.user = { userId };
    next();
  } catch (e: any) {
    console.log("[AUTH DEBUG] verify error:", e?.name, e?.message);
    return res.status(401).json({ message: "INVALID_OR_EXPIRED_TOKEN" });
    }
}