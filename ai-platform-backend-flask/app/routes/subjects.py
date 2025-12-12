"""
Routes pour les subjects
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.subject import Subject

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_subjects():
    """Récupérer tous les subjects"""
    subjects = Subject.query.all()
    return jsonify({
        'data': [subject.to_dict() for subject in subjects]
    }), 200

@subjects_bp.route('/<int:subject_id>', methods=['GET'])
@jwt_required(optional=True)
def get_subject(subject_id):
    """Récupérer un subject par ID"""
    subject = Subject.query.get_or_404(subject_id)
    return jsonify({
        'data': subject.to_dict()
    }), 200

@subjects_bp.route('', methods=['POST'])
@jwt_required()
def create_subject():
    """Créer un nouveau subject (admin seulement)"""
    # TODO: Ajouter vérification admin
    data = request.get_json()

    subject = Subject(
        subject_name=data.get('subject_name'),
        description=data.get('description'),
        level=data.get('level')
    )

    db.session.add(subject)
    db.session.commit()

    return jsonify({
        'data': subject.to_dict()
    }), 201

@subjects_bp.route('/<int:subject_id>', methods=['PUT'])
@jwt_required()
def update_subject(subject_id):
    """Modifier un subject (admin seulement)"""
    # TODO: Ajouter vérification admin
    subject = Subject.query.get_or_404(subject_id)
    data = request.get_json()

    subject.subject_name = data.get('subject_name', subject.subject_name)
    subject.description = data.get('description', subject.description)
    subject.level = data.get('level', subject.level)

    db.session.commit()

    return jsonify({
        'data': subject.to_dict()
    }), 200

@subjects_bp.route('/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    """Supprimer un subject (admin seulement)"""
    # TODO: Ajouter vérification admin
    subject = Subject.query.get_or_404(subject_id)

    db.session.delete(subject)
    db.session.commit()

    return jsonify({'message': 'Subject supprimé avec succès'}), 204
