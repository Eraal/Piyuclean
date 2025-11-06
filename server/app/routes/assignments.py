from flask import Blueprint, request, jsonify
from ..db import db
from ..models.models import TaskAssignment, TaskAssignmentStudent, Student, Classroom, Checklist, ChecklistTask, CleaningTask
from datetime import datetime
from typing import Optional

bp = Blueprint("assignments", __name__)


def _parse_iso_datetime(value: str) -> Optional[datetime]:
    """Parse ISO 8601 strings coming from the frontend.

    Accepts both '...Z' (UTC) and offsets like '+00:00'. Returns a timezone-aware
    datetime when possible. Returns None if input is falsy.
    Raises ValueError if parsing fails.
    """
    if not value:
        return None
    v = value.strip()
    # Replace trailing 'Z' with '+00:00' for broader compatibility
    if v.endswith('Z'):
        v = v[:-1] + '+00:00'
    return datetime.fromisoformat(v)


@bp.get("/")
def list_assignments_raw():
    items = TaskAssignment.query.order_by(TaskAssignment.date.desc()).all()
    result = []
    for ta in items:
        student_ids = [s.student.ext_id or str(s.student.id) for s in ta.students]
        result.append({
            "id": ta.ext_id or str(ta.id),
            "date": ta.date.isoformat(),
            "classroomId": ta.classroom.ext_id or str(ta.classroom.id),
            "studentIds": student_ids,
            "checklistId": ta.checklist.ext_id or str(ta.checklist.id),
            "status": ta.status,
            "completedAt": ta.completed_at.isoformat() if ta.completed_at else None,
            "comments": ta.comments,
        })
    return jsonify(result)


@bp.post("/")
def create_assignment():
    data = request.get_json(force=True, silent=True) or {}
    required = ["date", "classroomId", "studentIds", "checklistId", "status"]
    if any(not data.get(k) for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    # Resolve references
    classroom = Classroom.get_by_identifier(data["classroomId"]) if data.get("classroomId") else None
    checklist = Checklist.get_by_identifier(data["checklistId"]) if data.get("checklistId") else None
    if not classroom or not checklist:
        return jsonify({"message": "Invalid classroomId or checklistId"}), 400

    ext_id = data.get("id") or f"a-{int(datetime.utcnow().timestamp()*1000)}"
    ta = TaskAssignment(
        ext_id=ext_id,
        date=datetime.fromisoformat(data["date"]).date(),
        classroom_id=classroom.id,
        checklist_id=checklist.id,
        status=data.get("status", "assigned"),
        completed_at=_parse_iso_datetime(data.get("completedAt")) if data.get("completedAt") else None,
        comments=data.get("comments"),
    )
    db.session.add(ta)
    db.session.flush()

    for sid in data.get("studentIds", []):
        student = Student.get_by_identifier(sid)
        if student:
            db.session.add(TaskAssignmentStudent(assignment_id=ta.id, student_id=student.id))

    db.session.commit()
    return jsonify({"id": ta.ext_id or str(ta.id)}), 201


@bp.get("/expanded")
def list_assignments_expanded():
    # Flattened view similar to frontend getAssignments
    items = TaskAssignment.query.all()
    result = []

    for ta in items:
        classroom_name = ta.classroom.name
        checklist_tasks = ChecklistTask.query.filter_by(checklist_id=ta.checklist_id).order_by(ChecklistTask.position).all()
        tasks = [CleaningTask.query.get(ct.task_id) for ct in checklist_tasks]

        for tas in ta.students:
            student = tas.student
            for task in tasks:
                result.append({
                    "id": f"{ta.ext_id or ta.id}-{student.ext_id or student.id}-{task.ext_id or task.id}",
                    "assignmentId": ta.ext_id or str(ta.id),
                    "date": ta.date.isoformat(),
                    "classroomId": ta.classroom.ext_id or str(ta.classroom.id),
                    "classroomName": classroom_name,
                    "studentId": student.ext_id or str(student.id),
                    "studentName": f"{student.first_name} {student.last_name}",
                    "taskId": task.ext_id or str(task.id),
                    "taskName": task.name,
                    "status": ta.status,
                    "completedAt": ta.completed_at.isoformat() if ta.completed_at else None,
                    "comments": ta.comments,
                })
    return jsonify(result)


@bp.put("/<ext_id>")
def update_assignment(ext_id: str):
    ta = TaskAssignment.get_by_identifier(ext_id)
    if not ta:
        return jsonify({"message": "Not found"}), 404

    data = request.get_json(force=True, silent=True) or {}
    if data.get("date") is not None:
        ta.date = datetime.fromisoformat(data["date"]).date()
    if data.get("status") is not None:
        ta.status = data["status"]
    if "completedAt" in data:
        try:
            ta.completed_at = _parse_iso_datetime(data["completedAt"]) if data["completedAt"] else None
        except ValueError:
            return jsonify({"message": "Invalid completedAt format"}), 400
    if "comments" in data:
        ta.comments = data["comments"]

    if "studentIds" in data:
        TaskAssignmentStudent.query.filter_by(assignment_id=ta.id).delete()
        db.session.flush()
        for sid in data.get("studentIds") or []:
            student = Student.get_by_identifier(sid)
            if student:
                db.session.add(TaskAssignmentStudent(assignment_id=ta.id, student_id=student.id))

    db.session.commit()
    return jsonify({"id": ta.ext_id or str(ta.id)})


@bp.delete("/<ext_id>")
def delete_assignment(ext_id: str):
    ta = TaskAssignment.get_by_identifier(ext_id)
    if not ta:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(ta)
    db.session.commit()
    return jsonify({"ok": True})
