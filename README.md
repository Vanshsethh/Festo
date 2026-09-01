# Festo — College Event Ecosystem

Festo helps college communities discover, host, and attend events from one place. It replaces scattered event promotion and manual attendee tracking with one reliable flow: publish an event, reserve capacity safely, issue QR tickets, and manage entry at the venue.

## Problems Solved

- **Scattered discovery:** students browse live events by category and college.
- **Manual registration and overselling:** a PostgreSQL transaction and row lock reserve capacity safely.
- **Slow publishing:** authenticated users can add event details, choose a verified college, set ticket capacity, and publish immediately.
- **Manual entry checks:** every claimed ticket receives a secure QR token for check-in.

## Architecture

```text
React + Vite frontend
        │ REST / HTTP-only JWT cookie
        ▼
Express API ────────────► PostgreSQL (source of truth)
        │                         ▲
        ▼                         │
Redis + BullMQ ─────────► Worker ─┘
```

Festo is a modular monolith: API and worker are separate runtime processes sharing one Node.js codebase. PostgreSQL owns durable state; Redis runs asynchronous jobs only after database transactions commit.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, TanStack Query, Axios, Tailwind CSS, Lucide |
| Backend | Node.js, Express, REST, JavaScript ES modules |
| Data | PostgreSQL, `pg`, parameterized SQL, `node-pg-migrate` |
| Background work | Redis, BullMQ |
| Security | JWT in HTTP-only cookies, Argon2id hashing, Zod validation, server-side authorization |
| Local environment | Docker Compose: Postgres, Redis, API, worker |

## Current Features

- JWT-cookie authentication and protected user actions
- Public event discovery, category filtering, and event detail pages
- GGSIPU and DTU demo colleges with 34 future published events across 17 categories
- Event hosting with college selection, dates, venue, poster URL, and ticket capacity
- Quantity-based registration (1–10 tickets) with capacity enforcement
- Asynchronous QR-ticket generation and a **My Tickets** wallet
- Dark violet/indigo responsive interface

## Run Locally

```bash
# Backend: from festo-backend/
docker compose up -d --build postgres redis api worker
docker compose exec -T api npm run migrate:up
docker compose exec -T api npm run seed

# Frontend: from festo-frontend/
npm install
npm run dev
```

Open the Vite URL shown in the terminal—normally `http://localhost:5173` or `http://localhost:5174`. The API runs at `http://localhost:5001`.

## Security

Environment files, cookies, private keys, logs, and local dependencies are excluded from version control. Copy `.env.example` files for local setup; never commit real credentials.

## Documentation

- [Backend guide](festo-backend/README.md)
- [Frontend guide](festo-frontend/README.md)
