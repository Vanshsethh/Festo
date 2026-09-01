# Festo Backend

Festo is a college-event platform with public discovery, user-created events, capacity-controlled registration, and asynchronous digital tickets.

## Built With

- Node.js, Express, PostgreSQL (`pg`), and `node-pg-migrate`
- Redis and BullMQ for ticket generation and notifications
- JWT authentication in HTTP-only `festo_token` cookies
- Argon2id password hashing, Zod validation, and parameterized SQL
- Docker Compose for Postgres, Redis, API, and worker services

## Core Flows

- Users can register, log in, browse public events, and claim 1–10 tickets per event.
- Any authenticated user can host an event, select a verified college, set dates and ticket capacity, and publish it immediately.
- Registration locks the event row, prevents overselling, updates capacity, and queues ticket generation after commit.
- The BullMQ worker creates one secure QR ticket per requested quantity. Tickets are available through `/api/passes`.

## API Modules

- `auth`: register, login, logout, current user
- `events`: public listing/detail, create, update, cancel, and capacity
- `registrations`: register, cancel, and registration history
- `passes`: ticket wallet and individual QR-ticket retrieval
- `colleges`, `users`, `checkins`, `dashboard`, `media`, and notifications

## Local Development

Start the complete backend stack:

```bash
docker compose up -d --build postgres redis api worker
```

Apply migrations inside the API container:

```bash
docker compose exec -T api npm run migrate:up
```

Seed demo content without deleting existing users or registrations:

```bash
docker compose exec -T api npm run seed
```

The API is available at `http://localhost:5001`; health check: `http://localhost:5001/health`.

## Seed Data

`npm run seed` creates or refreshes:

- Guru Gobind Singh Indraprastha University (GGSIPU)
- Delhi Technological University (DTU)
- 34 published events: one event for each college in all 17 supported categories

Seeded events have future dates and capacities, so a registered user can claim tickets and see them in the frontend wallet.
