# Sebco Travels Backend

Self-hosted, zero-BaaS backend for the Sebco Travels / Premium Family Taxi ride-hailing app.

**Stack:** Node.js 18+, Express, MongoDB (Mongoose), Socket.io, Stripe (manual capture), Google Distance Matrix, JWT, PM2. No Firebase. No Supabase. No managed cloud database.

---

## What's inside

```
backend/
├── ecosystem.config.cjs      PM2 config (fork mode by default)
├── Dockerfile                Optional containerised deploy
├── .env.example              Copy to .env and fill in
├── src/
│   ├── server.js             HTTP + Socket.io entry, graceful shutdown
│   ├── app.js                Express app, middleware, routes
│   ├── config/               env, db, logger
│   ├── models/               User, Driver, Booking (Mongoose)
│   ├── middleware/           auth, error handler, zod validator
│   ├── utils/                booking state machine, geo helpers
│   ├── services/             maps, pricing, stripe, dispatch
│   ├── realtime/             Socket.io setup + handlers
│   ├── controllers/          HTTP request handlers
│   ├── routes/               Express route mounts
│   └── jobs/                 In-memory dispatch timeout queue
```

---

## Local development

```bash
cd backend
cp .env.example .env          # then fill the real values
npm install
npm run dev                   # node --watch src/server.js
```

You will need a running MongoDB locally:

```bash
# Ubuntu / Debian
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

---

## Production deploy with PM2

```bash
cd backend
npm ci --omit=dev
npm install -g pm2
npm run pm2:start
npm run pm2:save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

Logs live in `backend/logs/` and via `pm2 logs sebco-travels-api`.

### Cluster mode

Default is **fork mode, 1 instance** so Socket.io rooms and dispatch timers work without extra infra. To run across all CPU cores:

1. `sudo apt install -y redis-server`
2. Add `REDIS_URL=redis://127.0.0.1:6379` to `.env`
3. In `ecosystem.config.cjs` set `instances: "max"` and `exec_mode: "cluster"`
4. `npm run pm2:reload`

The Socket.io Redis adapter is loaded automatically when `REDIS_URL` is set.

---

## Booking state machine

```
pending  →  broadcasting  →  accepted  →  en_route  →  arrived  →  in_progress  →  completed
                          \                                                       
                           →  failed (no driver accepted)
any non-terminal state can also transition →  cancelled
```

Stripe behaviour:
- Booking created → `PaymentIntent` with `capture_method: "manual"` for the upfront fare. This places a temporary hold on the card.
- Status reaches `completed` → server calls Stripe **capture**.
- Status reaches `cancelled` or `failed` → server calls Stripe **cancel** (the hold is released).

---

## HTTP endpoints (summary)

| Method | Path                         | Description                                  | Auth          |
| ------ | ---------------------------- | -------------------------------------------- | ------------- |
| POST   | `/api/auth/register`         | Create a passenger or driver user            | none          |
| POST   | `/api/auth/login`            | JWT login                                    | none          |
| GET    | `/api/auth/me`               | Current user                                 | bearer        |
| POST   | `/api/leads`                 | Public booking enquiry from website (instant quote, no auth, rate-limited) | none |
| POST   | `/api/drivers/profile`       | Create / update driver profile               | bearer/driver |
| PATCH  | `/api/drivers/inventory`     | Update child seat / luggage / vehicle limits | bearer/driver |
| PATCH  | `/api/drivers/status`        | online / offline / on_trip                   | bearer/driver |
| POST   | `/api/pricing/quote`         | Distance + fare quote (no booking)           | bearer        |
| POST   | `/api/bookings`              | Create booking, lock fare, Stripe auth-hold  | bearer/pax    |
| GET    | `/api/bookings/:id`          | Booking detail                               | bearer        |
| POST   | `/api/bookings/:id/cancel`   | Passenger cancels (Stripe cancel)            | bearer/pax    |
| POST   | `/api/bookings/:id/advance`  | Driver advances state (en_route / arrived…)  | bearer/driver |
| POST   | `/api/webhooks/stripe`       | Stripe webhook receiver (raw body)           | stripe sig    |

---

## Socket.io events

**Server → Driver**
- `dispatch:offer` `{ bookingId, pickup, dropoff, fare, expiresInMs }`
- `dispatch:cancelled` `{ bookingId, reason }`

**Driver → Server**
- `dispatch:accept` `{ bookingId }`
- `dispatch:reject` `{ bookingId }`
- `gps:update` `{ lat, lng, heading?, speed? }`

**Server → Passenger**
- `booking:status` `{ bookingId, status }`
- `booking:assigned` `{ bookingId, driver: { name, vehicle, plate } }`
- `driver:location` `{ bookingId, lat, lng, heading?, speed?, at }`

All sockets must authenticate via `auth: { token: "<jwt>" }` on the handshake.

---

## What's intentionally NOT in this scaffold

- The two mobile apps (driver + passenger). The HTTP + Socket.io contracts above are stable, so the mobile teams can build against them in parallel.
- An admin web UI. Ask if you want one.
- E2E tests / CI. Add when ready.

---

## Costs

| Component           | Cost                                                                |
| ------------------- | ------------------------------------------------------------------- |
| MongoDB Community   | Free                                                                |
| Node + PM2          | Free                                                                |
| Socket.io           | Free                                                                |
| Stripe              | Per-transaction fee only                                            |
| Google Distance Matrix | $200/mo free credit (covers thousands of rides), pay-as-you-go after |
| Redis (optional)    | Free                                                                |
