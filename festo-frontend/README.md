# Festo Frontend

React single-page app for discovering, hosting, registering for, and managing college-event tickets.

## Built With

- React 18, Vite, React Router, and TanStack Query
- Tailwind CSS with reusable UI primitives and Lucide icons
- Axios with credentialed API requests to the Express backend
- Dark violet/indigo visual system with responsive public and authenticated pages

## Features

- JWT-cookie session hydration, login, registration, protected routes, and role-aware navigation
- Public event discovery, search, category filtering, event details, and capacity-aware registration
- User event-hosting form: choose a college, enter event details and dates, set ticket capacity, and publish immediately
- Ticket quantity selection (up to 10 tickets per registration)
- **My Tickets** wallet with generated QR tickets and pending-generation state
- College directory, registrations, check-in, dashboards, and account views

## Run Locally

Start the backend stack first from `festo-backend`:

```bash
docker compose up -d --build postgres redis api worker
```

Then start the frontend:

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`; use `http://localhost:5174` if 5173 is occupied). The backend permits both local Vite ports in development.

Build check:

```bash
npm run build
```
