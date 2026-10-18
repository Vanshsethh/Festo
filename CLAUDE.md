# CLAUDE.md — Festo Current Build

This document reflects the implemented local build. Read it before changing the product.

## Product

Festo is a college-event platform. Visitors discover published events; authenticated users can register, receive QR tickets, and host their own events under a selected verified college.

Current flow:

```text
User registers/logs in → browses events → claims 1–10 tickets
→ registration transaction reserves capacity → BullMQ worker generates QR tickets
→ tickets appear in My Tickets

Authenticated user → Host Event → selects GGSIPU/DTU (or another verified college)
→ enters details and capacity → event publishes immediately
```

## Stack

| Layer | Implementation |
| --- | --- |
| Frontend | React 18, Vite, React Router, TanStack Query, Axios, Tailwind CSS, Lucide |
| Backend | Node.js, Express, ES modules, REST |
| Database | PostgreSQL with `pg` and raw parameterized SQL |
| Migrations | `node-pg-migrate` |
| Async jobs | Redis and BullMQ |
| Authentication | JWT in HTTP-only `festo_token` cookie; Argon2id passwords |
| Local infrastructure | Docker Compose: Postgres, Redis, API, worker |

No ORM, GraphQL, payments, microservices, or localStorage tokens.

## Architecture Lock

Festo remains a modular monolith: one backend codebase with two runtime entrypoints.

- `npm run start:api` starts `src/server.js`, the Express HTTP API.
- `npm run start:worker` starts `src/workers/index.js`, the BullMQ processors.
- API and worker share modules, database access, and queue definitions, but run as separate processes.

```text
React / Vite frontend
        │ REST + HTTP-only JWT cookie
        ▼
Express API ─────────────► PostgreSQL (source of truth)
        │                         ▲
        ▼                         │
Redis / BullMQ ─────────► Worker ─┘
        │
        ├─ Cloudinary (event media)
        └─ Resend (email jobs)
```

PostgreSQL is always authoritative. Queue jobs run only after their database transaction commits. A Redis or worker outage must not block or roll back a confirmed registration; outstanding ticket work is recoverable.

### Backend Structure

```text
festo-backend/
├── src/
│   ├── app.js                 Express assembly; no `listen()`
│   ├── server.js              API entrypoint
│   ├── config/                environment and external-service configuration
│   ├── db/                    pool and transaction helpers
│   ├── middleware/            authentication, authorization, validation, errors
│   ├── modules/               auth, users, colleges, events, registrations,
│   │                          passes/tickets, checkins, notifications, dashboard, media
│   ├── workers/               queues and BullMQ processors
│   └── utils/                 JWT, password, QR, pagination, slugs
├── migrations/                node-pg-migrate schema history
├── seed.js                    idempotent demo-content seed
├── docker-compose.yml         postgres, redis, api, worker
└── Dockerfile
```

Each backend module follows:

```text
<module>.routes.js      route wiring
<module>.controller.js  request/response shaping only
<module>.service.js     business logic and transactions
<module>.repo.js        parameterized SQL only
<module>.schema.js      Zod validation
```

Controllers do not call `pool.query` directly, and services do not access `req` or `res`.

### Frontend Structure

```text
festo-frontend/src/
├── api/ and services/          Axios API client and endpoint services
├── hooks/                      auth and health state
├── components/                 UI, common, colleges, events, passes, checkins
├── pages/                      public, auth, student, college, admin
├── layouts/ and routes/        shell and routing
└── App.jsx / main.jsx          providers and application entrypoint
```

The frontend is a standalone Vite project; Docker Compose belongs to the backend because it owns the API, worker, PostgreSQL, and Redis runtime.

## Repository Layout

```text
festo-frontend/  React/Vite app
festo-backend/   Express API, workers, database migrations, Docker Compose
CLAUDE.md        Current implementation notes
```

Backend modules follow `routes → controller → service → repo`; controllers do not query PostgreSQL directly.

## Current Data Model

- `users`: roles are `USER` and `ORGANIZER`; account status is `ACTIVE` or `SUSPENDED`.
- `colleges`: verified colleges own public events.
- `events`: category, dates, capacity, `registered_count`, creator, and college.
- `registrations`: one registration per user/event, with `quantity` (1–10).
- `tickets`: one QR ticket per registration quantity.
- `notifications` and `check_ins`: notification and door-scan support.

Supported event categories: FEST, CULTURAL, DANCE, MUSIC, TECHNICAL, SPORTS, HACKATHON, WORKSHOP, CONCERT, COMPETITION, QUIZ, MUN, GAMING, LITERARY, DRAMA_THEATRE, ART_DESIGN, OTHER.

## API and UI Rules

- Public: event and college browsing.
- Authenticated `USER` or `ORGANIZER`: create, update, or cancel own events.
- Any authenticated user can use `/host`: a verified college must be selected and the event publishes immediately.
- Capacity is the total number of claimable tickets. The registration endpoint rejects requests that would exceed capacity.
- Frontend ticket API uses `/api/passes`; the user-facing route is `/tickets`.
- Development CORS permits `http://localhost:5173` and `http://localhost:5174`.
- UI uses a dark slate base with violet/indigo accents.

## Registration and Ticket Correctness

1. Lock the event row with `FOR UPDATE`.
2. Check event is published, the deadline and start date have not passed, quantity is 1–10, and capacity remains.
3. Insert the registration and increment `registered_count` in the same PostgreSQL transaction.
4. Commit first; then enqueue ticket generation.
5. The BullMQ worker generates idempotent tickets. Redis failure must never undo a confirmed registration.

## Local Run

From `festo-backend`:

```bash
docker compose up -d --build postgres redis api worker
docker compose exec -T api npm run migrate:up
docker compose exec -T api npm run seed
```

`seed` is idempotent and does not truncate user data. It creates/refreshes GGSIPU and DTU plus 34 future, published events: one for each college in every supported category.

API: `http://localhost:5001`  
Health: `http://localhost:5001/health`

From `festo-frontend`:

```bash
npm run dev
```

Open the Vite URL, normally `http://localhost:5173` or `http://localhost:5174` when 5173 is occupied.

## Verification

```bash
# Frontend production build
cd festo-frontend && npm run build

# Backend migration status
cd festo-backend && docker compose exec -T api npm run migrate:up

# Service status
docker compose ps
```

## Non-Negotiables

1. PostgreSQL is the source of truth; Redis/BullMQ is not.
2. Use parameterized SQL only.
3. JWT stays in an HTTP-only cookie.
4. Keep capacity reservation transactional and row-locked.
5. QR tokens must contain no PII.
6. Do not add payments, an ORM, GraphQL, or microservices without an explicit product decision.
