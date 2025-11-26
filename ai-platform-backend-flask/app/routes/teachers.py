"""
Routes pour les teachers
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.teacher import Teacher
from app.models.subject import Subject

teachers_bp = Blueprint('teachers', __name__)

@teachers_bp.route('', methods=['POST'])
def create_teacher():
    """Créer un nouveau teacher (inscription)"""
    data = request.get_json()
    
    # Validation des champs requis
    required_fields = ['first_name', 'last_name', 'email', 'password', 'cin']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Le champ {field} est requis'}), 400
    
    # Vérifier si l'email existe déjà
    if Teacher.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    # Vérifier si le CIN existe déjà
    if data.get('cin') and Teacher.query.filter_by(cin=data['cin']).first():
        return jsonify({'error': 'Ce CIN est déjà utilisé'}), 400
    
    # Gérer le subject (peut être un ID ou un nom)
    subject_id = data.get('subject_id')
    if not subject_id and data.get('subject'):
        # Si on reçoit le nom de la matière, chercher l'ID
        subject = Subject.query.filter_by(subject_name=data['subject']).first()
        if subject:
            subject_id = subject.id
    
    # Créer le teacher
    teacher = Teacher(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        cin=data['cin'],
        subject_id=subject_id,
        establishment=data.get('establishment'),
        experience_years=data.get('experience_years', 0),
        is_active=True
    )
    
    teacher.set_password(data['password'])
    
    db.session.add(teacher)
    db.session.commit()
    
    return jsonify({
        'message': 'Teacher créé avec succès',
        'data': teacher.to_dict()
    }), 201

@teachers_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_teachers():
    """Récupérer tous les teachers"""
    teachers = Teacher.query.filter_by(is_active=True).all()
    return jsonify({
        'data': [teacher.to_dict() for teacher in teachers]
    }), 200

@teachers_bp.route('/<int:teacher_id>', methods=['GET'])
@jwt_required(optional=True)
def get_teacher(teacher_id):
    """Récupérer un teacher par ID"""
    teacher = Teacher.query.get_or_404(teacher_id)
    return jsonify({
        'data': teacher.to_dict()
    }), 200

@teachers_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_teacher():
    """Récupérer le teacher actuel"""
    claims = get_jwt()
    if claims.get('user_type') != 'teacher':
        return jsonify({'error': 'Accès refusé'}), 403

    teacher_id = get_jwt_identity()
    teacher = Teacher.query.get_or_404(teacher_id)
    return jsonify({
        'data': teacher.to_dict()
    }), 200

@teachers_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_teacher():
    """Modifier le teacher actuel"""
    claims = get_jwt()
    if claims.get('user_type') != 'teacher':
        return jsonify({'error': 'Accès refusé'}), 403

    teacher_id = get_jwt_identity()
    teacher = Teacher.query.get_or_404(teacher_id)
    data = request.get_json()

    teacher.first_name = data.get('first_name', teacher.first_name)
    teacher.last_name = data.get('last_name', teacher.last_name)
    teacher.phone = data.get('phone', teacher.phone)
    teacher.subject_id = data.get('subject_id', teacher.subject_id)
    teacher.establishment = data.get('establishment', teacher.establishment)
    teacher.experience_years = data.get('experience_years', teacher.experience_years)

    if 'password' in data:
        teacher.set_password(data['password'])

    db.session.commit()

    return jsonify({
        'data': teacher.to_dict()
    }), 200

