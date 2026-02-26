# Job Management System

## About

A full-stack job portal with role-based dashboards: **Admin**, **Employer**, and **Jobseeker**.

---

## Features

- **Admin**
  - Central dashboard with total counts for users, employers, jobseekers, jobs, and applications.
  - Period stats for jobs posted and user registrations (daily, weekly, monthly, yearly).
  - Manage users (list, toggle active, delete).
  - Manage jobs (list, delete).
  - Manage applications (list, view).
  - Profile section (name, about).

- **Employer**
  - Register and log in as an employer.
  - Post new job listings.
  - View and manage own jobs (list, edit, delete).
  - View applications for their jobs, including applicant details and status (e.g. Seen).
  - Profile (name, designation, company).
  - Settings for updating email and password.

- **Jobseeker**
  - Register and log in as a jobseeker.
  - Browse available jobs (excluding already-applied jobs).
  - View job details (company, location, description).
  - Apply for jobs and withdraw applications.
  - View application history (My Applications).
  - Profile (name, skills, location).
  - Settings for updating email and password; logout.

- **Shared UI & layout**
  - Standard layout with header and footer across pages.
  - Left sidebar navigation with icons; collapsed by default and expands on hover to show labels.
  - Role-based menu items on the dashboard.
  - Responsive design optimized for desktop and mobile.

---

## Scope of assignment

- **Original scope (from brief):** Build a mobile-responsive job portal with three roles (Admin, Employer, Jobseeker), header/footer layout, vertical sidebar that expands on hover, admin dashboard with stats by period, role-based access control, SQLite persistence, HTML + Bootstrap frontend, and a Python backend (FastAPI).

- **Implemented (scope of assignment):**
  - All three roles with their required flows:
    - Admin: overview dashboard, period-based stats (daily/weekly/monthly/yearly), and management of jobs, employers, and jobseekers.
    - Employer: register, login, post jobs, and view applications for their postings.
    - Jobseeker: register, login, manage profile/settings, browse jobs, apply, and view application history.
  - Layout matching the requirements: header, footer, left sidebar with icon-only collapsed state and hover-to-expand behavior.
  - Authentication and role-based access control using JWT, with protected APIs for each role.
  - SQLite database for users, jobs, and applications.
  - HTML + Bootstrap-based responsive UI for login, registration, dashboard, and public pages.
  - README with setup and run instructions.

---

## Security measures implemented

- **CORS:** Origins restricted via config (no `*`); set `CORS_ORIGINS` in `.env` for production.
- **Response headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Error handling:** Unhandled exceptions return a generic message; no stack traces or DB details to the client.
- **JWT:** Short-lived access tokens (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`, default 30).
- **Rate limiting:** Login and register endpoints are rate-limited per IP (login: 10/min, register: 5/min); returns 429 when exceeded.
- **Passwords:** Bcrypt hashing; minimum 6 characters, at least one letter and one number.

---

## Logging (backend)

Structured logging is configured in `app.core.logging_config` and uses `LOG_LEVEL` from `.env`:

- **Request logging:** Each request is logged at INFO (method, path, status code, duration, client IP).
- **Auth:** Login/register success and failure are logged (no passwords or tokens); failed attempts at WARNING.
- **Errors:** Unhandled exceptions are logged with full traceback via `logger.exception`; clients receive a generic message.
- **Startup/shutdown:** One line at INFO when the app starts and stops.

Uvicorn access and SQLAlchemy engine logs are set to WARNING to reduce noise. Use `LOG_LEVEL=DEBUG` in `.env` for more detail during development.

---

## Privacy & consent (DPDP)

The app handles personal data and asks for explicit consent in line with India’s **Digital Personal Data Protection Act (DPDP)**:

- **Registration:** Mandatory checkbox — *“I agree to the Privacy Policy and consent to processing of my personal data.”* Registration is blocked until the user agrees.
- **Privacy Policy:** A dedicated page explains what data is collected, why, how long it is kept, and user rights; linked from registration and footer.
- **Welcome banner:** On first dashboard visit, a dismissible notice invites users to review the Privacy Policy; dismissal is remembered in the browser.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript; Bootstrap 4.
- **Backend:** Python, FastAPI, SQLite, SQLAlchemy, Alembic; JWT (python-jose), bcrypt.

---

## Database & migrations (Alembic)

- **Initial setup (after cloning):**
  - From `backend/`:
    ```bash
    alembic upgrade head
    ```
  - This creates all tables in the database configured via `DATABASE_URL` (default: `sqlite:///./jobportal.db`).
- **After model changes (development):**
  - Autogenerate a new migration and apply it:
    ```bash
    alembic revision -m "describe change" --autogenerate
    alembic upgrade head
    ```
- **Rollback (if needed):**
  - Step back one revision:
    ```bash
    alembic downgrade -1
    ```
---

## Setup Backend

1. From project root:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Create `backend/.env`. All values are read by the backend (`app.core.config`). Example:
   ```env
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///./jobportal.db
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
   LOG_LEVEL=INFO
   ```
   | Variable | Required | Purpose |
   |----------|----------|---------|
   | `SECRET_KEY` | Yes | JWT signing; keep secret. |
   | `DATABASE_URL` | No | SQLite path (default: `sqlite:///./jobportal.db`). |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | No | JWT expiry in minutes (default: 30). |
   | `CORS_ORIGINS` | No | Comma-separated allowed origins for frontend. |
   | `LOG_LEVEL` | No | Logging verbosity: `DEBUG`, `INFO`, `WARNING`, `ERROR` (default: `INFO`). |
3. Run initial migrations to create the database schema:
   ```bash
   alembic upgrade head
   ```
4. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```
   API: `http://localhost:8000` — Docs: `http://localhost:8000/docs`.

---

## Setup Frontend

1. From project root:
   ```bash
   cd frontend
   python -m http.server 5500
   ```
2. Open: `http://localhost:5500` (index, login, register, dashboard).
3. Ensure backend is running and `frontend/assets/js/config.js` points to the API (e.g. `http://localhost:8000/api/v1`).

---

## Running tests

- From `backend/`:
  ```bash
  pip install -r requirements.txt
  pytest tests/ -v
  ```
- Tests use a separate SQLite file (`backend/test_jobportal.db`) configured in `tests/conftest.py`, so they do not affect the main `jobportal.db`.

---

## Admin default credentials

After running backend migrations, a default admin is created if none exists:

| Field    | Value             |
|----------|-------------------|
| **Email**    | `admin@test.com`  |
| **Password** | `password123`    |

Change the password after first login via **Settings**.

---

## Future updates (out of scope for now)

- **User & product features**
  - Email verification and password reset.
  - Job categories, advanced filters, and full-text search.
  - File uploads (resumes, company logo) with basic validation.
  - Notifications (email/in-app) and richer activity feed.
  - Reporting and analytics with interactive charts and export options.

- **Security & compliance**
  - Account lockout and more advanced abuse detection.
  - Refresh tokens and token revocation.
  - CSRF protection if the auth model is changed to cookie-based tokens.
  - Audit logging and consent logging for DPDP/GDPR-style compliance.

## Screenshots

**Website:**
<img width="1919" height="843" alt="image" src="https://github.com/user-attachments/assets/69846ab8-451c-454c-8375-87b18fae986c" />
<img width="1895" height="837" alt="image" src="https://github.com/user-attachments/assets/5d57e580-a6e5-43f5-a58c-76d196ff74ed" />
<img width="1919" height="844" alt="image" src="https://github.com/user-attachments/assets/22602f79-7821-4f10-b8ec-1101004ff880" />
<img width="1919" height="841" alt="image" src="https://github.com/user-attachments/assets/5b1bc1f5-7c69-4a10-837a-397f81f40c0e" />
<img width="1917" height="828" alt="image" src="https://github.com/user-attachments/assets/cfc4ce16-774f-4ce2-ae1f-13b6949fe497" />
<img width="1919" height="830" alt="image" src="https://github.com/user-attachments/assets/0dfc9f07-9b03-487b-8698-430bd6b7e681" />
<img width="1902" height="837" alt="image" src="https://github.com/user-attachments/assets/09cb4c41-8c7a-4f7b-a967-645a376aa89e" />

**Swagger Docs:**
<img width="1908" height="811" alt="image" src="https://github.com/user-attachments/assets/ab8742f3-e527-4d73-84ca-76140d5aecfc" />

**Tests:**
<img width="908" height="398" alt="image" src="https://github.com/user-attachments/assets/5d2b3143-4fc1-44c3-8375-6f21f7bb8bcc" />

---
