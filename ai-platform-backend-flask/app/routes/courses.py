"""
Routes pour les courses
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
import os
from app import db
from app.models.course import Course, CourseFile
from app.models.teacher import Teacher
from app.models.notification import Notification  # ✅ ICI


courses_bp = Blueprint('courses', __name__)

def allowed_file(filename):
    """Vérifier si le fichier est autorisé"""
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@courses_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_courses():
    """Récupérer tous les courses (avec filtres optionnels)"""
    teacher_id = request.args.get('teacher_id', type=int)
    is_published = request.args.get('is_published', type=bool)

    query = Course.query

    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    
    if is_published is not None:
        query = query.filter_by(is_published=is_published)

    courses = query.order_by(Course.order_no, Course.created_at).all()

    include_files = request.args.get('include_files', 'false').lower() == 'true'
    include_exercises = request.args.get('include_exercises', 'false').lower() == 'true'
    include_teacher = request.args.get('include_teacher', 'false').lower() == 'true'

    return jsonify({
        'data': [course.to_dict(include_files=include_files, include_exercises=include_exercises, include_teacher=include_teacher) for course in courses]
    }), 200

@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required(optional=True)
def get_course(course_id):
    """Récupérer un course par ID"""
    course = Course.query.get_or_404(course_id)

    include_files = request.args.get('include_files', 'true').lower() == 'true'
    include_exercises = request.args.get('include_exercises', 'false').lower() == 'true'
    include_teacher = request.args.get('include_teacher', 'true').lower() == 'true'

    return jsonify({
        'data': course.to_dict(include_files=include_files, include_exercises=include_exercises, include_teacher=include_teacher)
    }), 200

@courses_bp.route('', methods=['POST'])
@jwt_required()
def create_course():
    """Créer un nouveau course (seulement pour teachers)"""
    try:
        claims = get_jwt()
        print(f"[DEBUG] Claims JWT: {claims}")
        
        if claims.get('user_type') != 'teacher':
            return jsonify({'error': 'Seuls les teachers peuvent créer des courses'}), 403

        data = request.get_json()
        print(f"[DEBUG] Données reçues: {data}")
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400

        # Validation du champ requis
        if not data.get('title'):
            return jsonify({'error': 'Le champ title est requis'}), 422

        teacher_id_str = get_jwt_identity()
        print(f"[DEBUG] Teacher ID depuis JWT (string): {teacher_id_str}")
        
        if not teacher_id_str:
            return jsonify({'error': 'Impossible de récupérer l\'identifiant du teacher'}), 401

        # Convertir en entier car l'identity est stockée comme string
        teacher_id = int(teacher_id_str)
        
        # Vérifier que le teacher existe
        teacher = Teacher.query.get(teacher_id)
        if not teacher:
            return jsonify({'error': f'Teacher introuvable (ID: {teacher_id})'}), 404

        print(f"[DEBUG] Création du course avec teacher_id={teacher_id}")
        
        course = Course(
            title=data.get('title'),
            description=data.get('description'),
            video_url=data.get('video_url'),
            order_no=data.get('order_no'),
            is_published=data.get('is_published', False),
            teacher_id=teacher_id,
        )

        db.session.add(course)
        db.session.commit()

        
        print(f"[DEBUG] Course créé avec succès: ID={course.id}")
        # 🔔 AJOUT DE LA NOTIFICATION ICI
        notif = Notification(
            title="📚 Nouveau cours ajouté",
            message=f"Le cours « {course.title} » est maintenant disponible",
            user_type="student"
        )
        db.session.add(notif)
        db.session.commit()


        return jsonify({
            'message': 'Course créé avec succès',
            'data': course.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Exception lors de la création du course: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erreur lors de la création du course: {str(e)}'}), 422

@courses_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    """Modifier un course (seulement le propriétaire teacher)"""
    claims = get_jwt()
    if claims.get('user_type') != 'teacher':
        return jsonify({'error': 'Seuls les teachers peuvent modifier des courses'}), 403

    course = Course.query.get_or_404(course_id)
    teacher_id = int(get_jwt_identity())

    if course.teacher_id != teacher_id:
        return jsonify({'error': 'Vous ne pouvez modifier que vos propres courses'}), 403

    data = request.get_json()

    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.video_url = data.get('video_url', course.video_url)
    course.order_no = data.get('order_no', course.order_no)
    course.is_published = data.get('is_published', course.is_published)

    db.session.commit()

    return jsonify({
        'data': course.to_dict()
    }), 200

@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    """Supprimer un course (seulement le propriétaire teacher)"""
    claims = get_jwt()
    if claims.get('user_type') != 'teacher':
        return jsonify({'error': 'Seuls les teachers peuvent supprimer des courses'}), 403

    course = Course.query.get_or_404(course_id)
    teacher_id = int(get_jwt_identity())

    if course.teacher_id != teacher_id:
        return jsonify({'error': 'Vous ne pouvez supprimer que vos propres courses'}), 403

    db.session.delete(course)
    db.session.commit()

    return jsonify({'message': 'Course supprimé avec succès'}), 204

@courses_bp.route('/<int:course_id>/files', methods=['POST'])
@jwt_required()
def upload_file(course_id):
    """Uploader un fichier pour un course"""
    claims = get_jwt()
    if claims.get('user_type') != 'teacher':
        return jsonify({'error': 'Seuls les teachers peuvent uploader des fichiers'}), 403

    course = Course.query.get_or_404(course_id)
    teacher_id = int(get_jwt_identity())

    if course.teacher_id != teacher_id:
        return jsonify({'error': 'Vous ne pouvez uploader des fichiers que pour vos propres courses'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'courses')
        os.makedirs(upload_folder, exist_ok=True)

        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        course_file = CourseFile(
            course_id=course_id,
            file_name=filename,
            file_path=file_path,
            file_type=filename.rsplit('.', 1)[1].lower(),
            file_size=os.path.getsize(file_path)
        )

        db.session.add(course_file)
        db.session.commit()

        return jsonify({
            'data': course_file.to_dict()
        }), 201

    return jsonify({'error': 'Type de fichier non autorisé'}), 400

@courses_bp.route('/uploads/courses/<path:filename>', methods=['GET'])
def serve_course_file(filename):
    """Servir les fichiers PDF/documents des cours"""
    try:
        # Chemin absolu vers le dossier uploads/courses
        upload_folder = os.path.join('uploads', 'courses')
        
        print(f"[DEBUG] Fichier demandé: {filename}")
        print(f"[DEBUG] Dossier: {upload_folder}")
        
        file_path = os.path.join(upload_folder, filename)
        
        if not os.path.exists(file_path):
            print(f"[ERROR] Fichier introuvable: {file_path}")
            return jsonify({'error': 'Fichier introuvable'}), 404
        
        return send_file(file_path)
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500