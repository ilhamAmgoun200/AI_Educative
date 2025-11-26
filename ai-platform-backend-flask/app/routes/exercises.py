"""
Routes pour les exercises
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app import db
from app.models.exercise import Exercise

exercises_bp = Blueprint('exercises', __name__)

@exercises_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_exercises():
    """Récupérer tous les exercises (avec filtres)"""
    course_id = request.args.get('course_id', type=int)
    student_id = request.args.get('student_id', type=int)

    query = Exercise.query

    if course_id:
        query = query.filter_by(course_id=course_id)
    if student_id:
        query = query.filter_by(student_id=student_id)

    exercises = query.order_by(Exercise.created_at.desc()).all()

    return jsonify({
        'data': [exercise.to_dict() for exercise in exercises]
    }), 200

@exercises_bp.route('/<int:exercise_id>', methods=['GET'])
@jwt_required(optional=True)
def get_exercise(exercise_id):
    """Récupérer un exercise par ID"""
    exercise = Exercise.query.get_or_404(exercise_id)
    return jsonify({
        'data': exercise.to_dict()
    }), 200

@exercises_bp.route('', methods=['POST'])
@jwt_required()
def create_exercise():
    """Créer un nouveau exercise"""
    claims = get_jwt()
    data = request.get_json()

    exercise = Exercise(
        title=data.get('title'),
        description=data.get('description'),
        questions=data.get('questions'),
        answers=data.get('answers'),
        course_id=data.get('course_id'),
        student_id=int(get_jwt_identity()) if claims.get('user_type') == 'student' else data.get('student_id'),
        score=data.get('score'),
        attempt_number=data.get('attempt_number', 1),
        feedback=data.get('feedback'),
        attempt_at=datetime.utcnow() if data.get('attempt_at') else None
    )

    db.session.add(exercise)
    db.session.commit()

    return jsonify({
        'data': exercise.to_dict()
    }), 201

@exercises_bp.route('/<int:exercise_id>', methods=['PUT'])
@jwt_required()
def update_exercise(exercise_id):
    """Modifier un exercise"""
    exercise = Exercise.query.get_or_404(exercise_id)
    claims = get_jwt()
    data = request.get_json()

    # Vérifier que c'est le propriétaire (student) ou un teacher
    if claims.get('user_type') == 'student' and exercise.student_id != int(get_jwt_identity()):
        return jsonify({'error': 'Vous ne pouvez modifier que vos propres exercises'}), 403

    exercise.title = data.get('title', exercise.title)
    exercise.description = data.get('description', exercise.description)
    exercise.questions = data.get('questions', exercise.questions)
    exercise.answers = data.get('answers', exercise.answers)
    exercise.score = data.get('score', exercise.score)
    exercise.feedback = data.get('feedback', exercise.feedback)

    db.session.commit()

    return jsonify({
        'data': exercise.to_dict()
    }), 200

@exercises_bp.route('/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(exercise_id):
    """Supprimer un exercise"""
    exercise = Exercise.query.get_or_404(exercise_id)
    claims = get_jwt()

    # Vérifier que c'est le propriétaire (student) ou un teacher
    if claims.get('user_type') == 'student' and exercise.student_id != int(get_jwt_identity()):
        return jsonify({'error': 'Vous ne pouvez supprimer que vos propres exercises'}), 403

    db.session.delete(exercise)
    db.session.commit()

    return jsonify({'message': 'Exercise supprimé avec succès'}), 204

