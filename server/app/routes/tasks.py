from flask import Blueprint, request, jsonify
from datetime import datetime
from ..db import db
from ..models.models import CleaningTask

bp = Blueprint("tasks", __name__)


@bp.get("/")
def list_tasks():
    items = CleaningTask.query.order_by(CleaningTask.name).all()
    return jsonify([
        {"id": t.ext_id or str(t.id), "name": t.name, "description": t.description or ""}
        for t in items
    ])


@bp.post("/")
def create_task():
    data = request.get_json(force=True, silent=True) or {}
    if not data.get("name"):
        return jsonify({"message": "name is required"}), 400
    ext_id = data.get("id") or f"t-{int(datetime.utcnow().timestamp()*1000)}"
    t = CleaningTask(ext_id=ext_id, name=data["name"], description=data.get("description", ""))
    db.session.add(t)
    db.session.commit()
    return jsonify({"id": t.ext_id or str(t.id)}), 201


@bp.put("/<ext_id>")
def update_task(ext_id: str):
    t = CleaningTask.get_by_identifier(ext_id)
    if not t:
        return jsonify({"message": "Not found"}), 404
    data = request.get_json(force=True, silent=True) or {}
    if data.get("name") is not None:
        t.name = data["name"]
    if data.get("description") is not None:
        t.description = data["description"]
    db.session.commit()
    return jsonify({"id": t.ext_id or str(t.id)})


@bp.delete("/<ext_id>")
def delete_task(ext_id: str):
    t = CleaningTask.get_by_identifier(ext_id)
    if not t:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True})
