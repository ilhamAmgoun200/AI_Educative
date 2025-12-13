from flask import Blueprint, request, jsonify
from flask_cors import CORS
from app.services.recommandation_service import rec_service
from app.models.course import Course
from app.models.student import Student
from app.models.student_progress import StudentProgress
from app.models.subject import Subject
from app.models.course_like import CourseLike
from app import db
from datetime import datetime, date
import logging



recommend_bp = Blueprint('recommendation', __name__)


def calculate_age(birth_date):
    """Calcule l'âge à partir de la date de naissance"""
    if not birth_date:
        return 20  # Âge par défaut
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


# Route de santé pour vérifier que l'API fonctionne
@recommend_bp.route('/health', methods=['GET'])
def health_check():
    """Vérifie que l'API et le modèle sont opérationnels"""
    try:
        if rec_service.model is None:
            return jsonify({
                'status': 'error',
                'message': 'Modèle non chargé'
            }), 503
        
        return jsonify({
            'status': 'ok',
            'message': 'Service opérationnel',
            'model_loaded': True
        }), 200
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@recommend_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_recommendations(student_id):
    try:
        limit = request.args.get('limit', default=10, type=int)
        min_score = request.args.get('min_score', default=0.6, type=float)
        exclude_completed = request.args.get('exclude_completed', default='true').lower() == 'true'

        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Étudiant non trouvé'}), 404

        # ✅ ÂGE ROBUSTE
        age = calculate_age(student.birth_date)
        if age <= 10 or age > 80:
            age = 17  # cohérent avec le modèle

        # ✅ FILIÈRE NORMALISÉE (ALIGNÉE AVEC LE TEST)
        branch_map = {
          # Depuis la base de données → Vers le modèle
          "SMA": "Sciences Maths (SM)",
          "SMB": "Sciences Maths (SM)",
          "SM": "Sciences Maths (SM)",
          "Sciences Mathématiques": "Sciences Maths (SM)",
          "Sciences Maths": "Sciences Maths (SM)",
          
          "PC": "Sciences Physiques (PC)",
          "Sciences Physiques": "Sciences Physiques (PC)",
          "Physique-Chimie": "Sciences Physiques (PC)",
          
          "SVT": "Sciences SVT",
          "Sciences SVT": "Sciences SVT",
          
          "EG": "Economie & Gestion",
          "Economie": "Economie & Gestion",
          "Gestion": "Economie & Gestion"
        }
        user_filliere = branch_map.get(
            (student.branch or "").strip().upper(),
            "Sciences SVT"
        )

        # Historique
        progress = StudentProgress.query.filter_by(student_id=student_id).all()
        completed_ids = [p.course_id for p in progress if p.is_completed]
        viewed_ids = [p.course_id for p in progress]

        history_courses = Course.query.filter(Course.id.in_(viewed_ids)).all()
        history_names = [c.title.strip() for c in history_courses]

        available_courses = Course.query.filter_by(is_published=True).all()
        recommendations = []

        for course in available_courses:
            if exclude_completed and course.id in completed_ids:
                continue

            # ✅ MATIÈRE ALIGNÉE AVEC LE MODÈLE
            subject_name = None

            if course.teacher and course.teacher.subject:
                subject_name = course.teacher.subject.subject_name.strip()
                print(f"[DEBUG] Course: {course.title}")
                print(f"        Teacher: {course.teacher.first_name if course.teacher else 'None'}")
                print(f"        Subject ID: {course.teacher.subject_id if course.teacher else 'None'}")
                print(f"        Subject Name: {subject_name}")
                print("---")

            if not subject_name:
                continue  # on ignore les cours non compatibles modèle

            prediction_data = {
                "user_filliere": user_filliere,
                "user_age": age,
                "user_history_names": history_names,
                "target_course_name": course.title.strip(),
                "target_matiere": subject_name
            }

            
            matiere_map = {
              # Le modèle attend SANS accents
              "Mathématiques": "Mathematiques",
              "mathématiques": "Mathematiques",
              "MATHÉMATIQUES": "Mathematiques",
              "Mathematiques": "Mathematiques",  # Déjà bon
              
              "Anglais": "Anglais",
              "anglais": "Anglais",
              
              "SVT": "SVT",
              "svt": "SVT",
              
              "Physique-Chimie": "Physique-Chimie",
              "Physique Chimie": "Physique-Chimie",
              "physique-chimie": "Physique-Chimie",
              "Physique": "Physique-Chimie",
              "Chimie": "Physique-Chimie",
              
              "Economie-Gestion": "Economie-Gestion",
              "Economie": "Economie-Gestion",
              "Gestion": "Economie-Gestion",
              
              "Philosophie": "Philosophie",
              "philosophie": "Philosophie"
            }
            
            subject_name_normalized = matiere_map.get(subject_name, subject_name)
            
            prediction_data = {
                "user_filliere": user_filliere,
                "user_age": age,
                "user_history_names": history_names,
                "target_course_name": course.title.strip(),
                "target_matiere": subject_name_normalized  # ✅ Version normalisée
            }

            result, status = rec_service.predict(prediction_data)

            # 🔍 LOG DEBUG (IMPORTANT)
            print(
                f"[REC] {course.title} | "
                f"score={result.get('score_confiance')} | "
                f"matiere={subject_name} | "
                f"filiere={user_filliere}"
            )

            if 'error' not in result and result.get('score_confiance', 0) >= min_score:
                recommendations.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'course_description': course.description,
                    'subject': subject_name,
                    'score_confiance': result['score_confiance'],
                    'recommandation': result['recommandation'],
                    'message': result['message'],
                    'teacher': {
                        'id': course.teacher.id,
                        'name': f"{course.teacher.first_name} {course.teacher.last_name}"
                    } if course.teacher else None,
                    'is_completed': course.id in completed_ids,
                    'is_viewed': course.id in viewed_ids
                })

        recommendations.sort(key=lambda x: x['score_confiance'], reverse=True)

        return jsonify({
            'student_id': student_id,
            'student_info': {
                'name': f"{student.first_name} {student.last_name}",
                'branch': user_filliere,
                'age': age,
                'courses_completed': len(completed_ids),
                'courses_viewed': len(viewed_ids)
            },
            'total_recommendations': len(recommendations),
            'min_score_threshold': min_score,
            'recommendations': recommendations[:limit]
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Erreur interne',
            'details': str(e)
        }), 500


@recommend_bp.route('/api/recommend', methods=['POST'])
def recommend():
    """
    Route principale de recommandation (générique)
    
    Exemple de requête JSON:
    {
        "user_filliere": "SVT",
        "user_age": 20,
        "user_history_names": ["Cours A", "Cours B", "Cours C"],
        "target_course_name": "Cours D",
        "target_matiere": "Mathématiques"
    }
    """
    try:
        # Vérification du Content-Type
        if not request.is_json:
            return jsonify({
                'error': 'Le Content-Type doit être application/json'
            }), 400
        
        data = request.get_json()
        
        # Validation des champs obligatoires
        required_fields = ['user_filliere', 'user_age', 'target_course_name', 'target_matiere']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Champs manquants: {", ".join(missing_fields)}'
            }), 400
        
        # Validation des types
        if not isinstance(data['user_age'], (int, float)):
            return jsonify({
                'error': 'user_age doit être un nombre'
            }), 400
        
        if 'user_history_names' in data and not isinstance(data['user_history_names'], list):
            return jsonify({
                'error': 'user_history_names doit être une liste'
            }), 400
        
        # Si user_history_names n'est pas fourni, on initialise une liste vide
        if 'user_history_names' not in data:
            data['user_history_names'] = []
        
        # Appel du service de prédiction
        result, status_code = rec_service.predict(data)
       


        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        return jsonify({
            'error': 'Erreur interne du serveur',
            'details': str(e)
        }), 500









