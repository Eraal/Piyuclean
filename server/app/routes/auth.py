from flask import Blueprint, request, jsonify
from ..db import db
from ..models.models import AdminUser, Student
from datetime import datetime

bp = Blueprint("auth", __name__)


@bp.post("/login")
def admin_login():
    data = request.get_json(force=True, silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "username and password required"}), 400

    user = AdminUser.query.filter_by(username=username, status="active").first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    user.last_login = datetime.utcnow()
    db.session.commit()
    return jsonify({
        "id": user.ext_id or str(user.id),
        "username": user.username,
        "fullName": user.full_name,
        "role": user.role,
        "status": user.status,
        "lastLogin": user.last_login.isoformat() if user.last_login else None,
    })


@bp.post("/student-login")
def student_login():
    data = request.get_json(force=True, silent=True) or {}
    student_id = data.get("studentId")
    password = data.get("password")

    if not student_id or not password:
        return jsonify({"message": "studentId and password required"}), 400

    student = Student.query.filter_by(student_id=student_id, status="active").first()
    if not student or not student.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "id": student.ext_id or str(student.id),
        "studentId": student.student_id,
        "firstName": student.first_name,
        "lastName": student.last_name,
        "classSection": student.class_section,
        "role": "Student",
        "status": student.status,
    })
