"""
Routes pour les likes/favoris avec gestion CORS
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.course_like import CourseLike
from app.models.course import Course
from app.models.student import Student

likes_bp = Blueprint('likes', __name__)

# 🔧 AJOUTER CETTE ROUTE OPTIONS EN PREMIER
@likes_bp.route('/courses/<int:course_id>/like', methods=['OPTIONS'])
def options_course_like(course_id):
    """Gérer les requêtes OPTIONS pour CORS"""
    response = jsonify({'message': 'CORS preflight'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response, 200

@likes_bp.route('courses/<int:course_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(course_id):
    """Ajouter ou retirer un like sur un cours"""
    # Vérifier que l'utilisateur est un étudiant
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Seuls les étudiants peuvent liker des cours'}), 403
    
    student_id = int(get_jwt_identity())
    
    # Vérifier si le cours existe
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Cours non trouvé'}), 404
    
    # Vérifier si le cours est publié
    if not course.is_published:
        return jsonify({'error': 'Ce cours n\'est pas publié'}), 403
    
    # Chercher un like existant
    existing_like = CourseLike.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if existing_like:
        # Retirer le like
        db.session.delete(existing_like)
        db.session.commit()
        
        # Compter les likes manuellement
        total_likes = CourseLike.query.filter_by(course_id=course_id).count()
        
        return jsonify({
            'message': 'Like retiré',
            'liked': False,
            'total_likes': total_likes
        }), 200
    else:
        # Ajouter un nouveau like
        new_like = CourseLike(
            student_id=student_id,
            course_id=course_id
        )
        db.session.add(new_like)
        db.session.commit()
        
        # Compter les likes manuellement
        total_likes = CourseLike.query.filter_by(course_id=course_id).count()
        
        return jsonify({
            'message': 'Cours liké',
            'liked': True,
            'total_likes': total_likes
        }), 201

@likes_bp.route('/courses/<int:course_id>/like', methods=['GET'])
@jwt_required()
def check_like(course_id):
    """Vérifier si l'étudiant a liké ce cours"""
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'liked': False}), 200
    
    student_id = int(get_jwt_identity())
    
    existing_like = CourseLike.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    return jsonify({
        'liked': existing_like is not None
    }), 200

# 🔧 AJOUTER OPTIONS POUR CETTE ROUTE AUSSI
@likes_bp.route('students/me/likes', methods=['OPTIONS', 'GET'])
@jwt_required()
def get_my_likes():
    """Récupérer tous les cours likés par l'étudiant connecté"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
    
    claims = get_jwt()
    if claims.get('user_type') != 'student':
        return jsonify({'error': 'Accès réservé aux étudiants'}), 403
    
    student_id = int(get_jwt_identity())
    
    # Récupérer tous les likes avec les cours associés
    likes = CourseLike.query.filter_by(student_id=student_id).all()
    
    liked_courses = []
    for like in likes:
        course = Course.query.get(like.course_id)
        if course:
            course_data = course.to_dict(
                include_files=True,
                include_teacher=True
            )
            # Ajouter la date du like
            course_data['liked_at'] = like.created_at.isoformat() if like.created_at else None
            liked_courses.append(course_data)
    
    return jsonify({
        'count': len(liked_courses),
        'liked_courses': liked_courses
    }), 200

@likes_bp.route('/courses/<int:course_id>/likes/count', methods=['GET'])
def get_course_likes_count(course_id):
    """Récupérer le nombre total de likes pour un cours"""
    count = CourseLike.query.filter_by(course_id=course_id).count()
    return jsonify({
        'course_id': course_id,
        'total_likes': count
    }), 200