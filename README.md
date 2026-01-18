# 🧹 PIYUCLEAN - Classroom Cleaning Management System

<div align="center">

![PIYUCLEAN](https://img.shields.io/badge/PIYUCLEAN-Classroom%20Cleaning%20System-10B981?style=for-the-badge&logo=sparkles&logoColor=white)

A modern, comprehensive classroom cleaning management and monitoring system designed for educational institutions.

**Built with React + TypeScript + Flask + PostgreSQL**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Default Credentials](#-default-credentials)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**PIYUCLEAN** is a full-stack web application designed to streamline classroom cleaning operations in educational institutions. It provides separate portals for administrators and students, enabling efficient task assignment, progress tracking, and completion monitoring.

The system helps schools:
- Organize and schedule cleaning duties
- Assign tasks to students randomly or specifically
- Track task completion in real-time
- Generate reports and analytics
- Maintain cleaning history records

---

## ✨ Features

### 🔐 Admin Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of cleaning statistics, weekly progress, and recent activities |
| **Student Management** | Add, edit, and manage student records with class sections |
| **Classroom Management** | Manage physical classrooms and learning spaces |
| **Task Management** | Create and organize cleaning tasks and checklists |
| **Assignment System** | Assign cleaning duties to students (random or specific selection) |
| **Completion Logs** | Monitor and verify task completion with timestamps |
| **Reports** | Generate cleaning reports and analytics with export options |
| **User Management** | Manage admin users (Administrators, Teachers, Class Advisers) |
| **Settings** | System configuration and database backup |

### 🎓 Student Portal

| Feature | Description |
|---------|-------------|
| **Student Dashboard** | View assigned tasks for today with completion status |
| **Task Completion** | Mark tasks as complete with confirmation dialogs |
| **Completion History** | Review personal cleaning history with filters |
| **Statistics** | View personal completion rate and task counts |
| **Export Data** | Export completion history to CSV |

### 🎨 Design Features

- Modern emerald/teal gradient theme
- Glassmorphic effects with backdrop blur
- Responsive design for mobile and desktop
- Color-coded status badges (Green: Completed, Amber: Pending, Red: Overdue)
- Smooth hover effects and transitions

---

## 🛠 Tech Stack

### Frontend (`piyuclean-system/`)

| Category | Technology |
|----------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite (with SWC) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Routing** | React Router DOM v6 |
| **State Management** | React Context API + TanStack React Query |
| **Forms** | React Hook Form + Zod (validation) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Date Handling** | date-fns + React Day Picker |

### Backend (`server/`)

| Category | Technology |
|----------|------------|
| **Framework** | Flask 3.0 |
| **Language** | Python 3.11+ |
| **Database ORM** | Flask-SQLAlchemy |
| **Database Migrations** | Flask-Migrate (Alembic) |
| **Database** | PostgreSQL 14+ |
| **CORS** | Flask-CORS |
| **Authentication** | Passlib + bcrypt (password hashing) |
| **Environment Config** | python-dotenv |

---

## 📁 Project Structure

```
IpragesXPiyuGuide/
├── piyuclean-system/          # Frontend React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities, API client, storage
│   │   └── pages/             # Page components
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                    # Backend Flask Application
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routes/            # API route blueprints
│   │   ├── __init__.py        # Flask app factory
│   │   ├── config.py          # Configuration settings
│   │   ├── db.py              # Database setup
│   │   └── seed.py            # Seed data script
│   ├── requirements.txt
│   ├── schema.sql             # Database schema (optional)
│   └── wsgi.py                # WSGI entry point
│
└── README.md                  # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or Bun)
- **Python** 3.11+
- **PostgreSQL** 14+
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Eraal/Piyuclean.git
cd Piyuclean
```

### 2. Backend Setup (Flask + PostgreSQL)

```powershell
# Navigate to server directory
cd server

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```powershell
# Create PostgreSQL database
# (Use pgAdmin or psql)
# Database name: piyuclean

# Create .env file from example
Copy-Item .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql+psycopg://postgres:yourpassword@localhost:5432/piyuclean
```

### 4. Initialize Database

```powershell
# Set environment variables
$env:FLASK_APP = "wsgi.py"

# Initialize migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed initial data (admin, sample students, classrooms, tasks)
flask seed
```

### 5. Frontend Setup (React + Vite)

```powershell
# Navigate to frontend directory
cd ..\piyuclean-system

# Install dependencies (using npm)
npm install

# Or using Bun
bun install
```

---

## ▶️ Running the Application

### Start Backend Server

```powershell
cd server
.\.venv\Scripts\Activate.ps1
python run.py
# or
flask run --port=5000
```

The API will be available at: `http://localhost:5000`

### Start Frontend Development Server

```powershell
cd piyuclean-system
npm run dev
# or
bun dev
```

The frontend will be available at: `http://localhost:5173`

---

## 🔑 Default Credentials

### Admin Portal

| Field | Value |
|-------|-------|
| **URL** | `http://localhost:5173/login` |
| **Username** | `admin` |
| **Password** | `admin123` |

### Student Portal

| Field | Value |
|-------|-------|
| **URL** | `http://localhost:5173/student/login` |
| **Student ID** | `student` |
| **Password** | `student123` |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/student/login` | Student login |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Classrooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classrooms` | Get all classrooms |
| POST | `/api/classrooms` | Create classroom |
| PUT | `/api/classrooms/:id` | Update classroom |
| DELETE | `/api/classrooms/:id` | Delete classroom |

### Tasks & Checklists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all cleaning tasks |
| GET | `/api/checklists` | Get all checklists |
| POST | `/api/checklists` | Create checklist |

### Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | Get all assignments |
| GET | `/api/assignments/expanded` | Get assignments with details |
| POST | `/api/assignments` | Create assignment |
| PUT | `/api/assignments/:id` | Update assignment status |
| DELETE | `/api/assignments/:id` | Delete assignment |

---

## 🗄️ Database Schema

### Core Tables

- **admin_users** - System administrators, teachers, class advisers
- **students** - Student records with class sections
- **classrooms** - Physical classroom information
- **cleaning_tasks** - Individual cleaning task definitions
- **checklists** - Groups of tasks as checklists
- **checklist_tasks** - Many-to-many: checklists ↔ tasks
- **task_assignments** - Assignment records
- **task_assignment_students** - Many-to-many: assignments ↔ students

### Entity Relationship

```
admin_users
students ─────┬──── task_assignment_students ────┬──── task_assignments
              │                                   │
classrooms ───┴───────────────────────────────────┤
                                                  │
checklists ───────── checklist_tasks ──── cleaning_tasks
```

---

## 📸 Screenshots

### Admin Dashboard
- Weekly statistics overview
- Completion rate charts
- Recent activities timeline

### Student Dashboard
- Personal task list
- Completion buttons
- History with filters

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for cleaner classrooms**

</div>
