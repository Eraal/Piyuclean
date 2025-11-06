-- Optional: Use this file if you want to create the schema directly with psql instead of using Flask-Migrate
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGSERIAL PRIMARY KEY,
  ext_id        TEXT UNIQUE NOT NULL, -- mirrors storage.ts id (e.g., "1")
  username      VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(128) NOT NULL,
  role          VARCHAR(32)  NOT NULL CHECK (role IN ('Administrator','Teacher','Class Adviser')),
  status        VARCHAR(16)  NOT NULL CHECK (status IN ('active','inactive')),
  last_login    TIMESTAMPTZ
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id            BIGSERIAL PRIMARY KEY,
  ext_id        TEXT UNIQUE NOT NULL, -- mirrors storage.ts id (e.g., "student-1")
  student_id    VARCHAR(64) UNIQUE NOT NULL,
  first_name    VARCHAR(64) NOT NULL,
  last_name     VARCHAR(64) NOT NULL,
  class_section VARCHAR(64) NOT NULL,
  status        VARCHAR(16) NOT NULL CHECK (status IN ('active','inactive')),
  password_hash TEXT NOT NULL
);

-- Classrooms
CREATE TABLE IF NOT EXISTS classrooms (
  id           BIGSERIAL PRIMARY KEY,
  ext_id       TEXT UNIQUE NOT NULL, -- mirrors storage.ts id (e.g., "classroom-1")
  classroom_id VARCHAR(64) UNIQUE NOT NULL,
  name         VARCHAR(128) NOT NULL,
  description  TEXT
);

-- Cleaning tasks
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id          BIGSERIAL PRIMARY KEY,
  ext_id      TEXT UNIQUE NOT NULL, -- mirrors storage.ts id (e.g., "task-1")
  name        VARCHAR(128) UNIQUE NOT NULL,
  description TEXT
);

-- Checklists
CREATE TABLE IF NOT EXISTS checklists (
  id          BIGSERIAL PRIMARY KEY,
  ext_id      TEXT UNIQUE NOT NULL, -- mirrors storage.ts id (e.g., "checklist-1")
  name        VARCHAR(128) UNIQUE NOT NULL,
  description TEXT
);

-- Checklists <-> Tasks (ordered)
CREATE TABLE IF NOT EXISTS checklist_tasks (
  checklist_id BIGINT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  task_id      BIGINT NOT NULL REFERENCES cleaning_tasks(id),
  position     INT    NOT NULL DEFAULT 0,
  PRIMARY KEY (checklist_id, task_id),
  UNIQUE (checklist_id, position)
);

-- Task assignments (group assignment referencing multiple students and a checklist)
CREATE TABLE IF NOT EXISTS task_assignments (
  id           BIGSERIAL PRIMARY KEY,
  ext_id       TEXT UNIQUE, -- optional external id if you want to mirror storage pattern
  date         DATE NOT NULL,
  classroom_id BIGINT NOT NULL REFERENCES classrooms(id),
  checklist_id BIGINT NOT NULL REFERENCES checklists(id),
  status       VARCHAR(16) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','completed','pending','overdue')),
  completed_at TIMESTAMPTZ,
  comments     TEXT
);

-- Assignment <-> Students (which students are part of a given assignment)
CREATE TABLE IF NOT EXISTS task_assignment_students (
  assignment_id BIGINT NOT NULL REFERENCES task_assignments(id) ON DELETE CASCADE,
  student_id    BIGINT NOT NULL REFERENCES students(id),
  PRIMARY KEY (assignment_id, student_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_date ON task_assignments(date);
CREATE INDEX IF NOT EXISTS idx_task_assignments_classroom ON task_assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_checklist ON task_assignments(checklist_id);

COMMIT;
