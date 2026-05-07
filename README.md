# ENOVA — AI English Learning Platform

## 🚀 Quick Start

### Prerequisites
- Java 17+ & Maven
- Node.js 18+ & npm
- MySQL 8+

### 1. Database Setup
```sql
CREATE DATABASE enova_db;
```
(Tables are auto-created by JPA on startup)

### 2. Backend
```bash
cd be
mvn spring-boot:run
```
Backend runs on **http://localhost:8080**

### 3. Frontend
```bash
cd fe
npm install
npm run dev
```
Frontend runs on **http://localhost:3000**

### 4. Default Accounts
Register a new account via the UI, or create an admin:
```sql
-- After registering, make a user admin:
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@enova.com';
```

## 📁 Project Structure
```
FLUENTO/
├── be/          # Spring Boot 3 Backend
│   ├── src/main/java/com/enova/
│   │   ├── config/        # Security, CORS, WebSocket
│   │   ├── controller/    # REST API endpoints
│   │   ├── dto/           # Request/Response DTOs
│   │   ├── exception/     # Global error handling
│   │   ├── model/         # JPA Entities (16 tables)
│   │   ├── repository/    # Spring Data repositories
│   │   ├── security/      # JWT auth
│   │   └── service/       # Business logic
│   └── src/main/resources/
│       ├── application.yaml
│       └── data.sql        # Seed data
│
└── fe/          # React + Vite + TypeScript Frontend
    └── src/
        ├── components/    # Layout, UI components
        ├── pages/         # All feature pages
        ├── services/      # API client
        ├── stores/        # Zustand state
        └── types/         # TypeScript interfaces

## 🎯 Features
1. **AI Roleplay Scenarios™** — Chat with AI in real scenarios
2. **Career English Engine** — Industry-specific vocabulary
3. **Real-Time Accent Coach** — Pronunciation analysis
4. **Emotion-Aware Tutor** — Adaptive learning
5. **Content Immersion Mode** — Learn from real content
6. **Social Speaking Rooms** — 24/7 voice rooms
7. **Performance DNA Report** — Weekly analytics

## 🔑 API Endpoints
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/user/dashboard` — Dashboard data
- `GET /api/roleplay/scenarios` — List scenarios
- `POST /api/roleplay/sessions/message` — Chat with AI
- `GET /api/career/paths` — Career paths
- `POST /api/accent/analyze` — Analyze pronunciation
- `GET /api/content` — Content feed
- `GET /api/speaking/rooms` — Speaking rooms
- `POST /api/performance/reports/generate` — Generate report
```
