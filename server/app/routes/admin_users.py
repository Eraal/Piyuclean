from flask import Blueprint, request, jsonify
from ..db import db
from ..models.models import AdminUser

bp = Blueprint("admin_users", __name__)


@bp.get("/")
def list_users():
    items = AdminUser.query.order_by(AdminUser.username).all()
    return jsonify([
        {
            "id": u.ext_id or str(u.id),
            "username": u.username,
            "fullName": u.full_name,
            "role": u.role,
            "status": u.status,
            "lastLogin": u.last_login.isoformat() if u.last_login else None,
        }
        for u in items
    ])


@bp.post("/")
def create_user():
    data = request.get_json(force=True, silent=True) or {}
    required = ["username", "password", "fullName", "role"]
    if any(not data.get(k) for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    u = AdminUser(
        ext_id=data.get("id"),
        username=data["username"],
        full_name=data["fullName"],
        role=data["role"],
        status=data.get("status", "active"),
    )
    u.set_password(data["password"])

    db.session.add(u)
    db.session.commit()

    return jsonify({"id": u.ext_id or str(u.id)}), 201


@bp.put("/<ext_id>")
def update_user(ext_id: str):
    u = AdminUser.get_by_identifier(ext_id)
    if not u:
        return jsonify({"message": "Not found"}), 404

    data = request.get_json(force=True, silent=True) or {}

    for k, v in {
        "username": data.get("username"),
        "full_name": data.get("fullName"),
        "role": data.get("role"),
        "status": data.get("status"),
    }.items():
        if v is not None:
            setattr(u, k, v)

    if pwd := data.get("password"):
        u.set_password(pwd)

    db.session.commit()
    return jsonify({"id": u.ext_id or str(u.id)})


@bp.delete("/<ext_id>")
def delete_user(ext_id: str):
    u = AdminUser.get_by_identifier(ext_id)
    if not u:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(u)
    db.session.commit()
    return jsonify({"ok": True})
