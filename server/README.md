# PiyuClean Backend (Flask + PostgreSQL)

This folder contains a Flask backend that mirrors the current frontend data model in `piyuclean-system/src/lib/storage.ts`.

## Features
- Auth endpoints for admin and students
- CRUD for Students, Classrooms, Tasks, Checklists
- Task Assignments (raw + expanded view similar to `getAssignments()`)
- SQLAlchemy models + Flask-Migrate
- Seed data to match your Local Storage defaults

## Requirements
- Python 3.11+
- PostgreSQL 14+
- Windows PowerShell

## Setup (Windows PowerShell)
1. Create and activate a virtual environment, then install deps:

```powershell
cd "c:\Users\geral\System Projects\IpragesXPiyuGuide\server"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Create `.env` from example and adjust if needed:

```powershell
Copy-Item .env.example .env
```

3. Initialize DB and run migrations:

```powershell
$env:FLASK_APP = "wsgi.py"
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/piyuclean"
flask db init
flask db migrate -m "init"
flask db upgrade
```

4. Seed initial data (admin, students, classrooms, tasks, checklists):

```powershell
flask seed
```

5. Run the server:

```powershell
python wsgi.py
```

The API will be available at http://127.0.0.1:5000.

## API Sketch
- POST /api/auth/login
- POST /api/auth/student-login
- GET/POST/PUT/DELETE /api/students
- GET/POST/PUT/DELETE /api/classrooms
- GET/POST/PUT/DELETE /api/tasks
- GET/POST/PUT/DELETE /api/checklists
- GET/POST/PUT/DELETE /api/assignments
- GET /api/assignments/expanded

All IDs in payloads accept the frontend `id` values (e.g., `student-1`). The backend stores those as `ext_id` and will return them where possible to keep the UI compatible.

## Dev proxy (Vite)
To avoid CORS during development, you can proxy `/api` to Flask. Update `piyuclean-system/vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": { target: "http://127.0.0.1:5000", changeOrigin: true },
  },
},
```

## Notes
- In production, make sure to set a strong `SECRET_KEY` and secure DB credentials.
- Passwords are hashed with bcrypt (passlib).
