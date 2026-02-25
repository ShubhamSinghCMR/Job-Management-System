# Job Management System

A modular **FastAPI** and **SQLite** application with a responsive **Bootstrap** frontend for managing jobs, applications, and role-based user workflows.

## 1. Features

- **Roles**: Admin, Employer, Jobseeker.
- **Auth**:
  - JWT-based authentication with hashed passwords (bcrypt via passlib).
  - Role-based access control on protected routes.
- **Admin**:
  - Overview stats: users, employers, jobseekers, jobs, applications.
  - Lists of users, jobs, and applications.
- **Employer**:
  - Post jobs, list own jobs.
  - View applications to their jobs (via jobs/applications APIs).
- **Jobseeker**:
  - Browse available jobs.
  - Apply to jobs and view own applications.
- **Frontend**:
  - Black & white responsive UI using Bootstrap 5.
  - Vertical sidebar dashboard with hover-expand behavior on desktop and top bar on mobile.

> Note: The original brief mentioned Flask; this implementation uses **FastAPI** for the backend, which provides better async support and an OpenAPI-powered `/docs` UI.

## 2. Backend Setup

Requirements:

- Python 3.11+
- SQLite (bundled with Python)

Steps (from repo root):

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows PowerShell

pip install -r requirements.txt
```

Create a `.env` file under `backend` (same folder as `requirements.txt`) with at least:

```env
SECRET_KEY=your-secret-key-here
```

Run database migrations:

```bash
cd backend
alembic upgrade head
```

Start the FastAPI app with Uvicorn:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

## 3. Frontend Setup

The frontend is a static HTML/JS app under `frontend/`.

You can serve it with any static server; for example, using Python:

```bash
cd frontend
python -m http.server 5500
```

Then open:

- `http://localhost:5500/index.html` – public landing page with job listings.
- `http://localhost:5500/login.html` – login.
- `http://localhost:5500/register.html` – registration.
- `http://localhost:5500/dashboard.html` – role-based dashboard (requires login).

The frontend calls the backend via `http://localhost:8000/api/v1` (configured in `frontend/assets/js/config.js`). Make sure both backend and frontend are running for full functionality.

## 4. Sample Data (Optional)

To quickly populate the system with sample users, jobs, and applications:

1. Start backend.
2. Log in as an **admin** user (or register then manually set role/admin in DB).
3. Call the seed endpoint:
   - `POST http://localhost:8000/api/v1/seed/` (requires admin token).

This will create:

- 1 admin, 2 employers, and several jobseekers.
- Multiple jobs and job applications for demo purposes.

## 5. Main Endpoints (Summary)

- **Auth**
  - `POST /api/v1/auth/register` – register user (Admin/Employer/Jobseeker).
  - `POST /api/v1/auth/login` – login via OAuth2 password grant; returns JWT.
- **Users**
  - `GET /api/v1/users/me` – current user profile.
  - `PUT /api/v1/users/me` – update name / password.
- **Jobs**
  - `GET /api/v1/jobs` – list all jobs.
  - `GET /api/v1/jobs/my` – employer’s own jobs.
  - `POST /api/v1/jobs` – create job (employer).
- **Applications**
  - `POST /api/v1/applications/{job_id}` – apply to a job (jobseeker).
  - `GET /api/v1/applications/my` – jobseeker’s applications.
  - `GET /api/v1/applications/job/{job_id}` – employer’s view of applications for a job.
- **Admin**
  - `GET /api/v1/admin/stats/overview` – high-level stats.
  - `GET /api/v1/admin/users` – list all users.
  - `GET /api/v1/admin/jobs` – list all jobs.
  - `GET /api/v1/admin/applications` – list all applications.

## 6. Running the Full App

1. **Start backend** with Uvicorn (see section 2).
2. **Serve frontend** from `frontend/` (see section 3).
3. Visit the landing page, register as one of the roles, login, and then use the dashboard according to your role:
   - Admin: statistics and management screens.
   - Employer: post and manage jobs.
   - Jobseeker: browse jobs and manage applications.

