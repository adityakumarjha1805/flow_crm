# Flow CRM

A responsive client lead-management CRM with a React dashboard and a secured Express/MongoDB REST API. Explore the local demo workspace without a database, or connect MongoDB for authenticated, persistent CRM data.

## Features

- Admin sign-in using a server-issued JWT and bcrypt-hashed passwords; protected CRM APIs.
- Dashboard totals, conversion rate, lead-status chart, seven-day activity chart, and recent leads.
- Lead search, status/source filters, date sorting, pagination, creation, editing, and deletion.
- Lead detail drawer with contact history, editable status, notes, and follow-up timeline.
- Follow-up scheduling and completion tracking.
- Public website contact form; submissions are validated, rate limited, and saved as new leads.
- Responsive navigation, keyboard-operable controls, form validation, confirmation dialogs, and status notifications.
- Demo workspace with ten sample leads that persist in browser local storage.

## Project structure

```text
server/
  config/          MongoDB connection
  middleware/      Authentication, validation, request safety, and errors
  models/          User, Lead, and FollowUp
  routes/          Authentication, leads, contact, and dashboard endpoints
  app.js
  index.js
  seed.js
api/
  [...path].js     Vercel serverless handler for the Express API
src/
  App.jsx          CRM views and interactive components
  App.css          Dashboard, table, drawer, and responsive styles
  index.css        Global typography and base styles
  services/        REST API client
```

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm
- MongoDB 6+ locally, or a MongoDB Atlas cluster

## Install and run

1. Install packages:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env`. The API uses local MongoDB at `mongodb://127.0.0.1:27017/mini_crm` by default; set `MONGODB_URI` only if you want to use a different MongoDB server. Add a private `JWT_SECRET` (at least 32 characters) and a unique `ADMIN_PASSWORD` (12–72 UTF-8 bytes). Keep `.env` private; it is ignored by Git.

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Install and start MongoDB Community Server locally, then seed the administrator and sample records:

   ```sh
   npm run seed
   ```

   Set `SEED_DEMO_DATA=false` if only the admin account should be created. Seeding sample leads replaces the sample addresses listed in `server/seed.js`; unrelated lead records are preserved.

4. Start the API and frontend in separate terminals:

   ```sh
   npm run server
   npm run dev
   ```

   Open the Vite URL (normally `http://localhost:5173`). The development server proxies `/api` requests to port 4000. Sign in with the administrator credentials configured in `.env`.

5. To explore without MongoDB, choose **Explore demo workspace** on the sign-in page. Demo changes are stored in that browser only and are separate from the secured server-backed workspace.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API server port (default `4000`) |
| `MONGODB_URI` | Private MongoDB connection string |
| `JWT_SECRET` | Private signing secret; use a randomly generated value of 32+ characters |
| `JWT_EXPIRES_IN` | JWT lifetime (default `8h`) |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed administrator; the password is hashed before storage |
| `SEED_DEMO_DATA` | Set to `true` to create ten sample leads and three follow-ups |
| `VITE_API_URL` | Optional public API origin for a separately hosted frontend; never put server secrets here |

## REST API

JSON request bodies are validated on the server. Admin endpoints require `Authorization: Bearer <token>`. Login and public contact submissions have independent rate limits.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public, rate limited | Authenticate an administrator |
| `GET` | `/api/health` | Public | API health check |
| `GET` | `/api/leads` | Admin | Search/filter/sort/page leads (`search`, `status`, `source`, `sort=newest\|oldest`, `page`, `limit`) |
| `GET` | `/api/leads/:id` | Admin | Lead details and follow-up history |
| `POST` | `/api/leads` | Admin | Create a lead |
| `PUT` | `/api/leads/:id` | Admin | Update lead fields |
| `DELETE` | `/api/leads/:id` | Admin | Delete a lead and its follow-ups |
| `POST` | `/api/leads/:id/notes` | Admin | Add a note (`{ "text": "..." }`) |
| `POST` | `/api/leads/:id/followups` | Admin | Schedule a follow-up (`{ "date": "...", "description": "..." }`) |
| `PATCH` | `/api/leads/:id/followups/:followUpId` | Admin | Set follow-up completion (`{ "completed": true }`) |
| `GET` | `/api/followups` | Admin | List follow-ups with their lead names |
| `GET` | `/api/dashboard/stats` | Admin | Lead counts, conversion rate, recent leads, daily activity |
| `POST` | `/api/contact` | Public, rate limited | Create a new Website Contact Form lead |

Lead fields: `name`, `email`, `phone`, `company`, `source`, `status` (`New`, `Contacted`, `Converted`, `Closed`), and `message`. Contact form submissions accept `name`, `email`, `phone`, and `message`; source and status are assigned by the API.

If `MONGODB_URI` is not set, the API and seeder connect to `mongodb://127.0.0.1:27017/mini_crm`. Make sure the MongoDB service is running before starting the API or seeding data.

## Database

Mongoose stores users, leads, and follow-ups in separate collections. Leads embed their notes; follow-ups reference their lead and administrator. Indexes support recent-lead ordering, status/source filtering, email lookup, and follow-up dates.

## Deployment

- Vercel serves the Vite frontend from `dist/` and routes `/api/*` requests to `api/[...path].js`, which runs the existing Express API as a serverless function. The function reuses its MongoDB connection while the instance stays warm.
- Create a MongoDB Atlas database and configure its network access to accept connections from Vercel. Vercel deployments may not have a fixed outbound IP; use a Vercel static egress IP when available, or allow `0.0.0.0/0` and secure the database with a strong, dedicated database user and password.
- Import the repository into Vercel. The included `vercel.json` sets the build command to `npm run build`, publishes `dist/`, and rewrites the `/contact` deep link to the SPA entry point without intercepting API or asset requests.
- Add `MONGODB_URI` (the Atlas connection string) and `JWT_SECRET` (a random secret of at least 32 bytes) to the Vercel project's Environment Variables for each environment you deploy. Optionally set `JWT_EXPIRES_IN`. Do not set `VITE_API_URL` for a same-origin Vercel deployment, and never expose database credentials or JWT secrets in `VITE_*` variables.
- Create the administrator once by running `npm run seed` locally with `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SEED_DEMO_DATA=false` set to the production values. This changes the configured database; run it only when you intend to provision that account. Keep these credentials private and do not commit `.env`.
- For deployments with a separate frontend origin, set `VITE_API_URL` to the API origin and `CORS_ORIGIN` to the exact frontend origin(s).
- Keep backups and monitoring enabled for the database; rotate JWT secrets deliberately because existing tokens will become invalid.
- Configure monitoring and backups for the database; rotate JWT secrets deliberately because existing tokens will become invalid.

## Screenshots

_Add screenshots of the dashboard, lead table, and mobile layout here._
