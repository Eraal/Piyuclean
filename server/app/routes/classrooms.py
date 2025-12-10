from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from ..db import db
from ..models.models import Classroom, TaskAssignment

bp = Blueprint("classrooms", __name__)


@bp.get("/")
def list_classrooms():
    items = Classroom.query.order_by(Classroom.name).all()
    return jsonify([
        {
            "id": c.ext_id or str(c.id),
            "classroomId": c.classroom_id,
            "name": c.name,
            "description": c.description or "",
        }
        for c in items
    ])


@bp.post("/")
def create_classroom():
    data = request.get_json(force=True, silent=True) or {}
    required = ["classroomId", "name"]
    if any(not data.get(k) for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    ext_id = data.get("id") or f"c-{int(datetime.utcnow().timestamp()*1000)}"
    c = Classroom(
        ext_id=ext_id,
        classroom_id=data["classroomId"],
        name=data["name"],
        description=data.get("description", ""),
    )
    db.session.add(c)
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Classroom with same id already exists", "detail": str(e.orig) if getattr(e, 'orig', None) else None}), 409
    return jsonify({"id": c.ext_id or str(c.id)}), 201


@bp.put("/<ext_id>")
def update_classroom(ext_id: str):
    c = Classroom.get_by_identifier(ext_id)
    if not c:
        return jsonify({"message": "Not found"}), 404

    data = request.get_json(force=True, silent=True) or {}
    for k, v in {
        "classroom_id": data.get("classroomId"),
        "name": data.get("name"),
        "description": data.get("description"),
    }.items():
        if v is not None:
            setattr(c, k, v)

    db.session.commit()
    return jsonify({"id": c.ext_id or str(c.id)})


@bp.delete("/<ext_id>")
def delete_classroom(ext_id: str):
    c = Classroom.get_by_identifier(ext_id)
    if not c:
        return jsonify({"message": "Not found"}), 404
    # Prevent deleting classrooms that are referenced by assignments
    if TaskAssignment.query.filter_by(classroom_id=c.id).first():
        return jsonify({"message": "Classroom is in use by assignments"}), 400
    db.session.delete(c)
    db.session.commit()
    return jsonify({"ok": True})
