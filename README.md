# Vitto — Loan Application Portal

A full-stack Loan Application Portal for Vitto's operations team. Built with Node.js + Express + PostgreSQL on the backend, and React (Vite) + Tailwind CSS on the frontend.

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | `[https://vitto-frontend.vercel.app](https://vitto-lite-app.vercel.app/)` |
| Backend API | `[https://vitto-backend.vercel.app](https://vitto-lite-api.vercel.app/)` |
| Health Check | `[https://vitto-backend.vercel.app/health](https://vitto-lite-api.vercel.app/health)` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 18+, Express 4, ES Modules |
| Database | PostgreSQL (Neon) |
| Frontend | React 18, Vite 5, Tailwind CSS, React Router v6 |
| Email | Nodemailer |
| Deployment | Vercel (both frontend + backend), NEON (Database)|

---

## Project Structure

```
vitto/
├── backend/
│   ├── db/
│   │   └── pool.js              # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── validators.js        # express-validator rules
│   │   └── errorHandler.js      # centralised error + 404
│   ├── migrations/
│   │   └── 001_init.sql         # Schema — run once on fresh DB
│   ├── routes/
│   │   ├── applications.js      # POST / GET / PATCH endpoints
│   │   └── summary.js           # GET /api/summary
│   ├── utils/
│   │   └── mailer.js            # Async SMTP confirmation email
│   ├── index.js                 # Express app entry point
│   ├── vercel.json              # Vercel serverless config
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/client.js        # Fetch wrapper + ApiError
    │   ├── components/          # Navbar, FormField, Badges, StatCard, StatusModal
    │   ├── hooks/useToast.jsx   # Toast notification system
    │   ├── pages/               # ApplyPage, DashboardPage, NotFoundPage
    │   ├── utils/helpers.js     # formatINR, formatDate, constants
    │   ├── App.jsx              # Router
    │   ├── main.jsx
    │   └── index.css            # Glass vars + global styles
    ├── index.html               # Tailwind CDN, Google Fonts
    ├── vite.config.js
    ├── .env
    └── vercel.json              # SPA rewrite rule
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A PostgreSQL database (Neon free tier recommended)

### 1. Clone the repo

```bash
git clone [https://github.com/your-username/vitto.git](https://github.com/HardikMahajan97/loan-app-vitto-lite.git)
cd loan-app-vitto-lite
```

### 2. Set up the database

Copy your Neon connection string, then run the migration:

```bash
psql "$DATABASE_URL" -f backend/migrations/001_init.sql
```

### 3. Configure the backend

```bash
cd backend
# Edit .env — set DATABASE_URL and optionally SMTP vars
npm install
npm run dev        # Runs on http://localhost:3001
```

### 4. Configure the frontend

```bash
cd frontend
# Set VITE_API_BASE_URL=http://localhost:3001 in your .env  (for local dev, leave blank — Vite proxy handles it)
npm install
npm run dev        # Runs on http://localhost:5173
```

### Vite proxy
`vite.config.js` proxies `/api` → `http://localhost:3001` in dev, so no CORS issues locally.

---

## Environment Variables

### Backend

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon/loaclhost connection string |
| `PORT` | `3001` |
| `NODE_ENV` | `developement(localhost)` |
| `ALLOWED_ORIGINS` | `http://localhost:5173(Or any other which you need)` |
| `SMTP_HOST` | `smtp.gmail.com` (optional) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | 16-char App Password |


### Frontend

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `http://localhost:3001(Or whichever you keep)` |

---

## API Reference

### `POST /api/applications`
Submit a new loan application.

**Body:**
```json
{
  "name": "Priya Sharma",
  "mobile": "9876543210",
  "amount": 50000,
  "purpose": "Business Expansion",
  "language": "Hindi",
  "email": "priya@example.com"   // optional
}
```

**Responses:** `201 Created` · `409 Conflict` (duplicate active) · `422 Validation Error`

---

### `GET /api/applications`
List all applications. Supports rich filtering + pagination.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending` \| `approved` \| `rejected` |
| `language` | string | `Hindi` \| `Tamil` \| `Telugu` \| `Marathi` \| `English` |
| `search` | string | Name (ILIKE) or exact mobile |
| `minAmount` | number | Minimum loan amount |
| `maxAmount` | number | Maximum loan amount |
| `from` | ISO date | Created on or after |
| `to` | ISO date | Created on or before |
| `sortBy` | string | `created_at` \| `amount` \| `name` \| `status` |
| `sortOrder` | string | `asc` \| `desc` |
| `page` | int | Page number (default: 1) |
| `limit` | int | Rows per page, max 100 (default: 10) |

---

### `PATCH /api/applications/:id/status`
Update application status. Only `pending → approved/rejected` transitions allowed.

**Body:** `{ "status": "approved" | "rejected" }`

---

### `GET /api/summary`
Returns aggregate statistics for the dashboard.

---

## Business Rules

- **One active application per mobile**: A mobile number can only have one `pending` or `approved` application at a time. Re-application is allowed only after rejection.
- **Status transitions**: Only `pending → approved` or `pending → rejected` are valid. Already-decided applications cannot be changed.
- **Loan range**: ₹1,000 minimum, ₹1,00,00,000 maximum.
- **Valid mobile**: Indian numbers only — 10 digits starting with 6–9.

---

## Email

Confirmation emails are sent **asynchronously** after a successful application submission. The HTTP response is never delayed by email delivery. Configure SMTP via `.env` — if vars are not set, email is silently skipped.

---

## Known Issues / What I'd Improve

- Add JWT-based auth to protect the PATCH endpoint from public access
- Add application history/audit log for status change tracking
- Add real-time updates via WebSocket or SSE on the dashboard
- Language filter in the form could auto-detect from browser locale
- Export applications to CSV from the dashboard
- Email notifications on Auth and on every step of loan

---
