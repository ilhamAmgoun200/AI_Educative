"""
Routes pour les students
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.student import Student
from datetime import datetime


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
    
    birth_date = None
    if data.get('birth_date'):
      birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()

    # Créer le student
    student = Student(
      first_name=data['first_name'],
      last_name=data['last_name'],
      email=data['email'],
      phone=data.get('phone'),
      cin=data['cin'],
      cne=data.get('cne'),
      birth_date=birth_date,
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




