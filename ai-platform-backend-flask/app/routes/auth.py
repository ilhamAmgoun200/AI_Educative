"""
Routes d'authentification
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.teacher import Teacher
from app.models.student import Student

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion pour teacher ou student"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')  # 'teacher' or 'student'

    if not email or not password or not user_type:
        return jsonify({'error': 'Email, password et userType sont requis'}), 400

    # Chercher dans la collection appropriée
    if user_type == 'teacher':
        user = Teacher.query.filter_by(email=email).first()
    elif user_type == 'student':
        user = Student.query.filter_by(email=email).first()
    else:
        return jsonify({'error': 'userType doit être "teacher" ou "student"'}), 400

    if not user or not user.check_password(password):
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    if not user.is_active:
        return jsonify({'error': 'Compte désactivé'}), 403

    # Créer le token JWT
    # Flask-JWT-Extended nécessite que l'identity soit une chaîne
    additional_claims = {
        'user_type': user_type,
        'user_id': user.id
    }
    access_token = create_access_token(
        identity=str(user.id),  # Convertir en string
        additional_claims=additional_claims
    )

    return jsonify({
        'token': access_token,
        'user': user.to_dict(),
        'userType': user_type
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Récupérer l'utilisateur actuel"""
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    user_type = claims.get('user_type')

    if user_type == 'teacher':
        user = Teacher.query.get(current_user_id)
    elif user_type == 'student':
        user = Student.query.get(current_user_id)
    else:
        return jsonify({'error': 'Type d\'utilisateur invalide'}), 400

    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    return jsonify({
        'user': user.to_dict(),
        'userType': user_type
    }), 200

