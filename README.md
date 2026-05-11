# ENOVA (FLUENTO) — Nen tang hoc tieng Anh thong minh

ENOVA (thu muc FLUENTO) la he thong hoc tieng Anh end-to-end gom backend Spring Boot va frontend React. Du an huong toi viec ca nhan hoa hanh trinh hoc tap, ket hop noi dung, tu vung, luyen noi, roleplay va phan tich hieu suat. Kien truc tach ROI ro rang giua API, xu ly nghiep vu, va giao dien nguoi dung de de mo rong va bao tri.

## 🚀 Quick Start

### Prerequisites
- Java 17+ & Maven
- Node.js 18+ & npm
- MySQL 8+

### 1. Database Setup
```sql
CREATE DATABASE enova_db;
```
(Bang duoc tao tu dong boi JPA khi khoi dong ung dung)

### 2. Backend
```bash
cd be
mvn spring-boot:run
```
Backend chay tai **http://localhost:8080**

### 3. Frontend
```bash
cd fe
npm install
npm run dev
```
Frontend chay tai **http://localhost:3000**

### 4. Tai khoan mac dinh
Dang ky tai khoan moi tren UI, sau do cap quyen admin:
```sql
-- Sau khi dang ky, cap quyen admin cho user:
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@enova.com';
```

## 🧩 Tong quan kien truc
- Backend: Spring Boot 3, REST API, JWT auth, lop nghiep vu ro rang (controller → service → repository).
- Frontend: React + Vite + TypeScript, phan trang va mo hinh trang theo chuc nang hoc tap.
- DB: MySQL 8, JPA/Hibernate, co seed data tu data.sql.
- Tich hop thuc hanh: speaking rooms, roleplay, content feed, tu vung va kiem tra.

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

## 🧠 Chuc nang chinh
1. **AI Roleplay Scenarios** — Tro chuyen theo tinh huong thuc te.
2. **Career English Engine** — Tu vung theo nganh nghe, bai hoc theo lo trinh.
3. **Real-Time Accent Coach** — Luyen phat am va nhan dien loi.
4. **Emotion-Aware Tutor** — Dieu chinh bai hoc theo hanh vi hoc tap.
5. **Content Immersion** — Hoc qua noi dung thuc te (bai viet, video, audio).
6. **Social Speaking Rooms** — Phong luyen noi thoi gian thuc.
7. **Performance DNA Report** — Bao cao hieu suat va tien do hoc tap.

## 🧭 Dinh huong su dung
- Nguoi hoc: hoc theo lo trinh, tu vung, kiem tra va tong hop.
- Quan tri vien: quan ly noi dung, nguoi dung, thong ke va kiem duyet.
- Giao tiep thoi gian thuc: speaking rooms va roleplay cho luyen phan xa.

## 🔐 Bao mat va xac thuc
- JWT authentication cho cac API bao ve.
- Phan quyen vai tro (USER/ADMIN).
- CORS va cau hinh bao mat trong lop `config` va `security`.

## 🔑 API Endpoints (tieu bieu)
- `POST /api/auth/register` — Dang ky
- `POST /api/auth/login` — Dang nhap
- `GET /api/user/dashboard` — Du lieu dashboard
- `GET /api/roleplay/scenarios` — Danh sach tinh huong
- `POST /api/roleplay/sessions/message` — Chat AI
- `GET /api/career/paths` — Lo trinh nghe nghiep
- `POST /api/accent/analyze` — Phan tich phat am
- `GET /api/content` — Content feed
- `GET /api/speaking/rooms` — Speaking rooms
- `POST /api/performance/reports/generate` — Tao bao cao

## 🧪 Data & Seed
- `data.sql` chua du lieu khoi tao cho demo.
- `db/migration` chua migrations (neu co).

## ▶️ Script tien loi
- `start-backend.bat` — Bat backend nhanh.
- `start-frontend.bat` — Bat frontend nhanh.

## 🏗️ Huong dan build va deploy

### Backend (Spring Boot)
Build jar:
```bash
cd be
mvn clean package
```
Chay jar (production):
```bash
java -jar target/*.jar
```
Neu can bo qua test (tuy chon):
```bash
mvn clean package -DskipTests
```

### Frontend (React + Vite)
Build production:
```bash
cd fe
npm run build
```
Preview build local:
```bash
npm run preview
```
Thu muc output: `fe/dist`

### Deploy goi y
- Backend: deploy file jar len server (VM/Docker), set env va chay `java -jar`.
- Frontend: host `fe/dist` bang Nginx/Apache/Static hosting.
- Cau hinh bien moi truong (API base URL) theo moi truong dev/staging/prod.
- Mo port 8080 cho backend va 80/443 cho frontend.

## 📌 Ghi chu
- Vui long cap nhat `application.yaml` de phu hop DB local (host, user, password).
- Neu can build production, hay chay build cho backend va frontend theo quy trinh CI/CD rieng cua nhom.
```
