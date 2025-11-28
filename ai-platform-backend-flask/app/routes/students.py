"""
Routes pour les students
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.student import Student

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['POST'])
def create_student():
    """Créer un nouveau student (inscription)"""
    data = request.get_json()
    
    # Validation des champs requis
    required_fields = ['first_name', 'last_name', 'email', 'password', 'cin']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Le champ {field} est requis'}), 400
    
    # Vérifier si l'email existe déjà
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    # Vérifier si le CIN existe déjà
    if data.get('cin') and Student.query.filter_by(cin=data['cin']).first():
        return jsonify({'error': 'Ce CIN est déjà utilisé'}), 400
    
    # Vérifier si le CNE existe déjà (si fourni)
    if data.get('cne') and Student.query.filter_by(cne=data['cne']).first():
        return jsonify({'error': 'Ce CNE est déjà utilisé'}), 400
    
    # Créer le student
    student = Student(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        cin=data['cin'],
        cne=data.get('cne'),
        birth_date=data.get('birth_date'),
        branch=data.get('branch'),
        establishment=data.get('establishment'),
        is_active=True
    )
    
    student.set_password(data['password'])
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'message': 'Student créé avec succès',
        'data': student.to_dict()
    }), 201

@students_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_students():
    """Récupérer tous les students"""
    students = Student.query.filter_by(is_active=True).all()
    return jsonify({
        'data': [student.to_dict() for student in students]
    }), 200

@students_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required(optional=True)
def get_student(student_id):
    """Récupérer un student par ID"""
    student = Student.query.get_or_404(student_id)
    return jsonify({
        'data': student.to_dict()
    }), 200

@students_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_student():
    """Récupérer le student actuel"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    student = Student.query.get_or_404(student_id)
    return jsonify({
        'data': student.to_dict()
    }), 200

@students_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_student():
    """Modifier le student actuel"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    student = Student.query.get_or_404(student_id)
    data = request.get_json()

    # Mettre à jour tous les champs de base
    student.first_name = data.get('first_name', student.first_name)
    student.last_name = data.get('last_name', student.last_name)
    student.email = data.get('email', student.email)
    student.phone = data.get('phone', student.phone)
    student.cin = data.get('cin', student.cin)
    student.establishment = data.get('establishment', student.establishment)
    student.birth_date = data.get('birth_date', student.birth_date)
    student.branch = data.get('branch', student.branch)
    student.cne = data.get('cne', student.cne)

    if 'password' in data:
        student.set_password(data['password'])

    db.session.commit()

    return jsonify({
        'data': student.to_dict()
    }), 200