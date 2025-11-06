from .db import db
from .models.models import AdminUser, Student, Classroom, CleaningTask, Checklist, ChecklistTask
from datetime import datetime


def seed_data():
    # Admin user
    if AdminUser.query.count() == 0:
        admin = AdminUser(ext_id="1", username="admin", full_name="System Administrator", role="Administrator", status="active")
        admin.set_password("admin123")
        db.session.add(admin)

    # Students
    if Student.query.count() == 0:
        defaults = [
            ("student-1", "student", "Juan", "Dela Cruz", "BSIT 1A"),
            ("student-2", "2024001", "Maria", "Santos", "BSIT 1B"),
            ("student-3", "2024002", "John", "Smith", "BSIT 2A"),
            ("student-4", "2024003", "Ana", "Garcia", "BSIT 3A AMG"),
            ("student-5", "2024004", "Carlos", "Lopez", "BSIT 4D NETAD"),
        ]
        for ext_id, sid, fn, ln, cs in defaults:
            s = Student(ext_id=ext_id, student_id=sid, first_name=fn, last_name=ln, class_section=cs, status="active")
            s.set_password("student123")
            db.session.add(s)

    # Classrooms
    if Classroom.query.count() == 0:
        rooms = [
            ("classroom-1", "ROOM-101", "Computer Lab 1", "Main computer laboratory"),
            ("classroom-2", "ROOM-102", "Computer Lab 2", "Secondary computer laboratory"),
            ("classroom-3", "ROOM-201", "Lecture Hall A", "Large lecture hall for presentations"),
        ]
        for ext_id, rid, name, desc in rooms:
            db.session.add(Classroom(ext_id=ext_id, classroom_id=rid, name=name, description=desc))

    # Tasks
    if CleaningTask.query.count() == 0:
        tasks = [
            ("task-1", "Sweep the floor", "Clean and sweep the entire floor area"),
            ("task-2", "Arrange chairs", "Organize chairs in proper rows"),
            ("task-3", "Clean whiteboard", "Wipe and clean the whiteboard"),
            ("task-4", "Empty trash bins", "Remove and replace trash bag liners"),
        ]
        for ext_id, name, desc in tasks:
            db.session.add(CleaningTask(ext_id=ext_id, name=name, description=desc))

    db.session.commit()

    # Checklists (after tasks exist)
    if Checklist.query.count() == 0:
        daily = Checklist(ext_id="checklist-1", name="Daily Classroom Cleaning", description="Basic daily cleaning tasks for classrooms")
        weekly = Checklist(ext_id="checklist-2", name="Weekly Deep Clean", description="Comprehensive weekly cleaning tasks")
        db.session.add_all([daily, weekly])
        db.session.flush()

        # Map tasks
        task_map = {t.ext_id: t for t in CleaningTask.query.all()}
        for pos, ext in enumerate(["task-1", "task-2", "task-3"], start=1):
            db.session.add(ChecklistTask(checklist_id=daily.id, task_id=task_map[ext].id, position=pos))
        for pos, ext in enumerate(["task-1", "task-2", "task-3", "task-4"], start=1):
            db.session.add(ChecklistTask(checklist_id=weekly.id, task_id=task_map[ext].id, position=pos))

    db.session.commit()
