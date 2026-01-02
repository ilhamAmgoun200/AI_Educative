from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models.notification import Notification
from app import db

notifications_bp = Blueprint("notifications", __name__)

# 🔔 Récupérer notifications étudiant
@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    claims = get_jwt()
    if claims.get("user_type") != "student":
        return jsonify({"error": "Accès interdit"}), 403

    notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    return jsonify({"data": [n.to_dict() for n in notifications]}), 200


# ✅ Marquer comme lue
@notifications_bp.route("/<int:id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(id):
    notif = Notification.query.get_or_404(id)
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification lue"}), 200
