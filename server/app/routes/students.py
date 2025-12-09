from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from ..db import db
from ..models.models import Student, TaskAssignmentStudent

bp = Blueprint("students", __name__)


@bp.get("/")
def list_students():
    items = Student.query.order_by(Student.last_name, Student.first_name).all()
    return jsonify([
        {
            "id": s.ext_id or str(s.id),
            "studentId": s.student_id,
            "firstName": s.first_name,
            "lastName": s.last_name,
            "classSection": s.class_section,
            "status": s.status,
        }
        for s in items
    ])


@bp.post("/")
def create_student():
    data = request.get_json(force=True, silent=True) or {}
    required = ["studentId", "firstName", "lastName", "classSection"]
    if any(not data.get(k) for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    # ensure ext_id present
    ext_id = data.get("id") or f"s-{int(datetime.utcnow().timestamp()*1000)}"

    s = Student(
        ext_id=ext_id,
        student_id=data["studentId"],
        first_name=data["firstName"],
        last_name=data["lastName"],
        class_section=data["classSection"],
        status=data.get("status", "active"),
    )
    # Ensure we always set a password_hash to satisfy NOT NULL constraint
    pwd = data.get("password") or "student123"
    s.set_password(pwd)

    db.session.add(s)
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Student with same studentId or id already exists", "detail": str(e.orig) if getattr(e, 'orig', None) else None}), 409
    return jsonify({"id": s.ext_id or str(s.id)}), 201


@bp.put("/<ext_id>")
def update_student(ext_id: str):
    # Resolve student by ext id, falling back to numeric internal id when applicable
    s = Student.get_by_identifier(ext_id)
    if not s:
        return jsonify({"message": "Not found"}), 404

    data = request.get_json(force=True, silent=True) or {}
    for k, v in {
        "student_id": data.get("studentId"),
        "first_name": data.get("firstName"),
        "last_name": data.get("lastName"),
        "class_section": data.get("classSection"),
        "status": data.get("status"),
    }.items():
        if v is not None:
            setattr(s, k, v)

    if pwd := data.get("password"):
        s.set_password(pwd)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Duplicate studentId detected", "detail": str(e.orig) if getattr(e, 'orig', None) else None}), 409
    return jsonify({"id": s.ext_id or str(s.id)})


@bp.delete("/<ext_id>")
def delete_student(ext_id: str):
    # Resolve student by ext id, falling back to numeric internal id when applicable
    s = Student.get_by_identifier(ext_id)
    if not s:
        return jsonify({"message": "Not found"}), 404
    # Remove assignment links first to satisfy FK constraints
    TaskAssignmentStudent.query.filter_by(student_id=s.id).delete()
    db.session.flush()
    db.session.delete(s)
    db.session.commit()
    return jsonify({"ok": True})
