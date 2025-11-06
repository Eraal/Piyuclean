from flask import Blueprint, request, jsonify
from datetime import datetime
from ..db import db
from ..models.models import Checklist, CleaningTask, ChecklistTask

bp = Blueprint("checklists", __name__)


@bp.get("/")
def list_checklists():
    items = Checklist.query.order_by(Checklist.name).all()
    result = []
    for cl in items:
        task_ids = [t.task.ext_id or str(t.task.id) for t in sorted(cl.tasks, key=lambda x: x.position)]
        result.append({
            "id": cl.ext_id or str(cl.id),
            "name": cl.name,
            "description": cl.description or "",
            "taskIds": task_ids,
        })
    return jsonify(result)


@bp.post("/")
def create_checklist():
    data = request.get_json(force=True, silent=True) or {}
    if not data.get("name"):
        return jsonify({"message": "name is required"}), 400

    ext_id = data.get("id") or f"l-{int(datetime.utcnow().timestamp()*1000)}"
    cl = Checklist(ext_id=ext_id, name=data["name"], description=data.get("description", ""))
    db.session.add(cl)
    db.session.flush()

    # Map tasks by ext ids in order
    task_ids = data.get("taskIds", [])
    for pos, task_ext in enumerate(task_ids, start=1):
        task = CleaningTask.get_by_identifier(task_ext)
        if task:
            db.session.add(ChecklistTask(checklist_id=cl.id, task_id=task.id, position=pos))

    db.session.commit()
    return jsonify({"id": cl.ext_id or str(cl.id)}), 201


@bp.put("/<ext_id>")
def update_checklist(ext_id: str):
    cl = Checklist.get_by_identifier(ext_id)
    if not cl:
        return jsonify({"message": "Not found"}), 404

    data = request.get_json(force=True, silent=True) or {}
    if data.get("name") is not None:
        cl.name = data["name"]
    if data.get("description") is not None:
        cl.description = data["description"]

    if "taskIds" in data:
        # Replace mapping
        ChecklistTask.query.filter_by(checklist_id=cl.id).delete()
        db.session.flush()
        for pos, task_ext in enumerate(data.get("taskIds") or [], start=1):
            task = CleaningTask.get_by_identifier(task_ext)
            if task:
                db.session.add(ChecklistTask(checklist_id=cl.id, task_id=task.id, position=pos))

    db.session.commit()
    return jsonify({"id": cl.ext_id or str(cl.id)})


@bp.delete("/<ext_id>")
def delete_checklist(ext_id: str):
    cl = Checklist.get_by_identifier(ext_id)
    if not cl:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(cl)
    db.session.commit()
    return jsonify({"ok": True})
