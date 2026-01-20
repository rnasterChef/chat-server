# Chat Server (JWT + Socket.IO + Supabase)

게임 내 실시간 채팅 기능을 위한 **Node.js 기반 백엔드 서버**입니다.  
JWT 인증을 사용해 사용자를 식별하고, Socket.IO로 실시간 메시지를 송수신하며,  
채팅 기록은 Supabase(PostgreSQL)에 영속 저장됩니다.

---

## ✨ 주요 기능

- 🔐 **JWT 기반 인증**
  - Socket.IO 연결 시 access token 검증
  - sender_id는 서버가 JWT `sub`로 강제 설정 (스푸핑 방지)

- 💬 **실시간 채팅 (Socket.IO)**
  - 방(room) 단위 채팅
  - 다중 사용자 동시 접속 및 브로드캐스트

- 🗄 **채팅 기록 저장**
  - Supabase `chat_messages` 테이블에 메시지 영속화
  - REST API로 과거 채팅 기록 조회 가능

- 🚀 **배포 완료**
  - AWS EC2 + PM2로 백그라운드 실행

---

## 🧱 기술 스택

- **Node.js / TypeScript**
- **Express**
- **Socket.IO**
- **Supabase (PostgreSQL)**
- **JWT (jsonwebtoken)**
- **AWS EC2 + PM2**

---

## 📁 프로젝트 구조
