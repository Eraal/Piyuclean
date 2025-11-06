from datetime import datetime, date
from typing import Optional
from passlib.hash import bcrypt
from sqlalchemy import UniqueConstraint
from ..db import db


# Helper mixin for common id + external id string ('ext_id')
class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    ext_id = db.Column(db.String, unique=True, index=True)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @classmethod
    def get_by_identifier(cls, identifier: str):
        """Fetch a record by external string id first, then by integer id if identifier is numeric.

        This avoids unsafe comparisons between integer primary keys and string literals
        that can cause database type errors when using OR conditions.
        """
        obj = cls.query.filter(cls.ext_id == identifier).first()
        if not obj and isinstance(identifier, str) and identifier.isdigit():
            try:
                obj = cls.query.filter(cls.id == int(identifier)).first()
            except ValueError:
                # In case identifier is too large or not a valid int representation
                obj = None
        return obj


class AdminUser(BaseModel):
    __tablename__ = "admin_users"

    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(32), nullable=False)
    status = db.Column(db.String(16), nullable=False, default="active")
    last_login = db.Column(db.DateTime(timezone=True))

    def set_password(self, password: str):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.password_hash)


class Student(BaseModel):
    __tablename__ = "students"

    student_id = db.Column(db.String(64), unique=True, nullable=False)
    first_name = db.Column(db.String(64), nullable=False)
    last_name = db.Column(db.String(64), nullable=False)
    class_section = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(16), nullable=False, default="active")
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password: str):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.password_hash) if self.password_hash else False


class Classroom(BaseModel):
    __tablename__ = "classrooms"

    classroom_id = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)


class CleaningTask(BaseModel):
    __tablename__ = "cleaning_tasks"

    name = db.Column(db.String(128), unique=True, nullable=False)
    description = db.Column(db.Text)


class Checklist(BaseModel):
    __tablename__ = "checklists"

    name = db.Column(db.String(128), unique=True, nullable=False)
    description = db.Column(db.Text)
    tasks = db.relationship("ChecklistTask", back_populates="checklist", cascade="all, delete-orphan")


class ChecklistTask(db.Model):
    __tablename__ = "checklist_tasks"

    checklist_id = db.Column(db.Integer, db.ForeignKey("checklists.id"), primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("cleaning_tasks.id"), primary_key=True)
    position = db.Column(db.Integer, nullable=False, default=0)

    checklist = db.relationship("Checklist", back_populates="tasks")
    task = db.relationship("CleaningTask")

    __table_args__ = (
        UniqueConstraint("checklist_id", "position", name="uq_checklist_position"),
    )


class TaskAssignment(BaseModel):
    __tablename__ = "task_assignments"

    date = db.Column(db.Date, nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey("classrooms.id"), nullable=False)
    checklist_id = db.Column(db.Integer, db.ForeignKey("checklists.id"), nullable=False)
    status = db.Column(db.String(16), nullable=False, default="assigned")
    completed_at = db.Column(db.DateTime(timezone=True))
    comments = db.Column(db.Text)

    classroom = db.relationship("Classroom")
    checklist = db.relationship("Checklist")
    students = db.relationship("TaskAssignmentStudent", back_populates="assignment", cascade="all, delete-orphan")


class TaskAssignmentStudent(db.Model):
    __tablename__ = "task_assignment_students"

    assignment_id = db.Column(db.Integer, db.ForeignKey("task_assignments.id"), primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), primary_key=True)

    assignment = db.relationship("TaskAssignment", back_populates="students")
    student = db.relationship("Student")
