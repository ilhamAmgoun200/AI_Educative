"""
Routes pour la progression des étudiants
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.student import Student
from app.models.course import Course
from app.models.teacher import Teacher
from app.models.student_progress import StudentProgress
from sqlalchemy import func

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/mark-viewed/<int:course_id>', methods=['POST'])
@jwt_required()
def mark_course_viewed(course_id):
    """Marquer un cours comme consulté"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    
    # Vérifier que le cours existe
    course = Course.query.get_or_404(course_id)
    
    # Chercher ou créer la progression
    progress = StudentProgress.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if not progress:
        progress = StudentProgress(
            student_id=student_id,
            course_id=course_id
        )
        db.session.add(progress)
    
    progress.last_viewed_at = db.func.now()
    db.session.commit()
    
    return jsonify({
        'message': 'Cours marqué comme consulté',
        'data': progress.to_dict()
    }), 200

@progress_bp.route('/mark-completed/<int:course_id>', methods=['POST'])
@jwt_required()
def mark_course_completed(course_id):
    """Marquer un cours comme terminé"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    
    # Vérifier que le cours existe
    course = Course.query.get_or_404(course_id)
    
    # Chercher ou créer la progression
    progress = StudentProgress.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if not progress:
        progress = StudentProgress(
            student_id=student_id,
            course_id=course_id
        )
        db.session.add(progress)
    
    progress.is_completed = True
    progress.completed_at = db.func.now()
    progress.last_viewed_at = db.func.now()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cours marqué comme terminé',
        'data': progress.to_dict()
    }), 200

@progress_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_student_progress_stats():
    """Récupérer les statistiques de progression par matière"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    
    # Récupérer tous les teachers avec leurs matières
    teachers = Teacher.query.filter_by(is_active=True).all()
    
    result = []
    
    for teacher in teachers:
        if not teacher.subject:
            continue
            
        # Compter le nombre total de cours publiés pour ce professeur
        total_courses = Course.query.filter_by(
            teacher_id=teacher.id,
            is_published=True
        ).count()
        
        if total_courses == 0:
            continue
        
        # Compter le nombre de cours complétés par l'étudiant
        completed_courses = db.session.query(func.count(StudentProgress.id)).filter(
            StudentProgress.student_id == student_id,
            StudentProgress.is_completed == True,
            StudentProgress.course_id.in_(
                db.session.query(Course.id).filter_by(
                    teacher_id=teacher.id,
                    is_published=True
                )
            )
        ).scalar() or 0
        
        # Calculer le pourcentage
        percentage = round((completed_courses / total_courses) * 100, 1) if total_courses > 0 else 0
        
        result.append({
            'subject_id': teacher.subject.id,
            'subject_name': teacher.subject.subject_name,
            'description': teacher.subject.description,
            'level': teacher.subject.level,
            'teacher_id': teacher.id,
            'teacher_name': f"{teacher.first_name} {teacher.last_name}",
            'total_courses': total_courses,
            'completed_courses': completed_courses,
            'percentage': percentage
        })
    
    return jsonify({
        'data': result
    }), 200

@progress_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_progress(course_id):
    """Récupérer la progression d'un cours spécifique"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès refusé'}), 403

    student_id = int(get_jwt_identity())
    
    progress = StudentProgress.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if not progress:
        return jsonify({
            'data': {
                'is_completed': False,
                'last_viewed_at': None
            }
        }), 200
    
    return jsonify({
        'data': progress.to_dict()
    }), 200

