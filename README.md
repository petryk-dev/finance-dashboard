# Finance Dashboard

A full-stack personal finance tracker for logging income and expenses, categorizing transactions, and visualizing spending trends at a glance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)](https://jwt.io/)
[![Recharts](https://img.shields.io/badge/Charts-Recharts-8884d8)](https://recharts.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

**Live demo:** [DEMO_URL]

---

## Screenshots

| Dashboard                              | Transactions                                 |
| -------------------------------------- | -------------------------------------------- |
| ![Dashboard](screenshot-dashboard.png) | ![Transactions](screenshot-transactions.png) |

---

## Features

- **JWT authentication** — register/login with access + refresh tokens, automatic silent refresh on 401
- **Dashboard overview** — monthly income/expense/balance summary cards, a 6-month income vs. expense trend line, and a category breakdown donut chart
- **Transaction management** — create, filter, paginate, and delete transactions with a category-aware modal form
- **Custom categories** — income and expense categories with icon + color, seeded with 10 sensible defaults
- **Analytics API** — server-computed monthly summaries, category breakdowns, and trends, scoped per user
- **Validated end-to-end** — Zod schemas on both the API boundary and the client forms
- **Secure by default** — hashed passwords, rate-limited auth routes, per-user data isolation, Helmet + CORS
- **Dark, responsive UI** — Tailwind CSS dark theme, mobile-friendly layout, Inter typeface

---

## Tech Stack

| Layer            | Technology                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| Frontend         | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, React Hook Form, Zod |
| Backend          | Node.js, Express, TypeScript, Zod                                                 |
| Database         | PostgreSQL, Prisma ORM                                                            |
| Auth             | JWT (access + refresh tokens), bcrypt password hashing                            |
| Deployment       | Vercel (frontend), Railway (backend + Postgres)                                   |
| Containerization | Docker (multi-stage, non-root runtime)                                            |

---

## Project Structure

```
finance-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # env, Prisma client
│   │   ├── controllers/    # route handlers
│   │   ├── middleware/     # auth, error handling, rate limiting
│   │   ├── routes/         # Express routers
│   │   ├── services/       # business logic / DB access
│   │   ├── validators/     # Zod schemas
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── railway.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/login, (auth)/register
│   │   ├── dashboard/
│   │   └── transactions/
│   ├── components/{charts,transactions,ui}/
│   ├── lib/                # api client, auth context, schemas
│   └── vercel.json
└── README.md
```

---

## Getting Started

### Option A — Docker (backend + Postgres)

```bash
cd backend
cp .env.example .env          # edit secrets if you like
docker compose up --build
```

This builds the API image, starts Postgres, runs `prisma migrate deploy`, and serves the API at `http://localhost:4000`. Seed the demo data once the containers are up:

```bash
docker compose exec app npx prisma db seed
```

Then, in a separate terminal, run the frontend locally:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000` and log in with the demo credentials below.

### Option B — Fully local (no Docker)

**Backend**

```bash
cd backend
cp .env.example .env          # point DATABASE_URL at your local Postgres
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev                   # http://localhost:4000
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### Demo credentials

```
email:    demo@finance.com
password: demo123456
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Description                       | Example                                                           |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------- |
| `PORT`                   | API server port                   | `4000`                                                            |
| `NODE_ENV`               | Runtime environment               | `development`                                                     |
| `DATABASE_URL`           | PostgreSQL connection string      | `postgresql://postgres:postgres@localhost:5432/finance_dashboard` |
| `JWT_ACCESS_SECRET`      | Secret for signing access tokens  | _random string_                                                   |
| `JWT_REFRESH_SECRET`     | Secret for signing refresh tokens | _random string_                                                   |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime             | `15m`                                                             |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime            | `7d`                                                              |
| `FRONTEND_URL`           | Allowed CORS origin               | `http://localhost:3000`                                           |

### Frontend (`frontend/.env.local`)

| Variable              | Description                 | Example                     |
| --------------------- | --------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:4000/api` |

No real secrets are committed anywhere in this repo — only placeholders in `.env.example` files.

---

## API Overview

| Method     | Endpoint                     | Description                                        |
| ---------- | ---------------------------- | -------------------------------------------------- |
| POST       | `/api/auth/register`         | Create an account, returns tokens                  |
| POST       | `/api/auth/login`            | Authenticate, returns tokens                       |
| POST       | `/api/auth/refresh`          | Exchange a refresh token for a new access token    |
| POST       | `/api/auth/logout`           | Revoke a refresh token                             |
| GET/POST   | `/api/categories`            | List / create categories                           |
| PUT/DELETE | `/api/categories/:id`        | Update / delete a category                         |
| GET/POST   | `/api/transactions`          | List (filterable, paginated) / create transactions |
| PUT/DELETE | `/api/transactions/:id`      | Update / delete a transaction                      |
| GET        | `/api/analytics/summary`     | Current-month income, expense, balance             |
| GET        | `/api/analytics/by-category` | Current-month expenses grouped by category         |
| GET        | `/api/analytics/monthly`     | Income vs. expense for the last 6 months           |
| GET        | `/api/analytics/recent`      | Last 5 transactions                                |

All routes except `/api/auth/*` require a `Bearer` access token and are scoped to the authenticated user.

---

## Deployment

- **Backend → Railway**: connect the repo, set the root directory to `backend/`, add the environment variables above, and Railway will build from the included `Dockerfile` per `railway.json` (runs `prisma migrate deploy` on start).
- **Frontend → Vercel**: connect the repo, set the root directory to `frontend/`, and add `NEXT_PUBLIC_API_URL` pointing at your deployed backend. `vercel.json` is intentionally empty — configure environment variables in the Vercel dashboard.

---

## Notes

- Written in TypeScript strict mode throughout, with no `any` types.
- `npm audit` flags advisories in `next@14.2.x` that are only fixed by upgrading to Next.js 16; they concern custom-server/image-optimizer/i18n-middleware surfaces this app doesn't use. Worth revisiting on a future major-version upgrade.

---

## 👤 Author

**Volodymyr Petryk**

[LinkedIn](https://linkedin.com/in/volodymyr-petryk) · [petryk.developer@gmail.com](mailto:petryk.developer@gmail.com)
