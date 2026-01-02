import os
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from app import db
from app.models.course import Course
from app.models.exercise import Exercise
from app.services import generate_ai_exercise_pdf_for_course
from app.models.notification import Notification


exercises_bp = Blueprint('exercises', __name__)

# Dossier où les PDF seront stockés
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'exercises')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@exercises_bp.route('', methods=['POST'])
@jwt_required()
def create_exercise():
    try:
        print("=" * 50)
        print("DEBUG - Données reçues:")
        print(f"Form data: {dict(request.form)}")
        print(f"Files: {dict(request.files)}")
        print("=" * 50)

        title = request.form.get('title')
        description = request.form.get('description')
        course_id_str = request.form.get('course_id')
        file = request.files.get('file')

        print(f"title: {title}")
        print(f"description: {description}")
        print(f"course_id_str: {course_id_str}")
        print(f"file: {file}")

        # ✅ Validation des champs requis
        if not title or not course_id_str:
            print(f"ERREUR: Champs manquants - title={title}, course_id={course_id_str}")
            return jsonify({"error": "title et course_id requis"}), 400

        try:
            course_id = int(course_id_str)
            print(f"course_id converti: {course_id}")
        except ValueError:
            print(f"ERREUR: course_id invalide - {course_id_str}")
            return jsonify({"error": "course_id doit être un nombre"}), 400

        course = Course.query.get(course_id)
        if not course:
            print(f"ERREUR: Cours introuvable - ID: {course_id}")
            return jsonify({"error": f"Cours introuvable (ID: {course_id})"}), 404

        # ✅ Gestion du fichier PDF
        filename = None
        if file:
            filename = secure_filename(file.filename)
            upload_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(upload_path)
            print(f"Fichier sauvegardé: {upload_path}")

        # ✅ Création de l'exercice
        exercise = Exercise(
            title=title,
            description=description,
            pdf_file=filename,
            course_id=course_id
        )

        db.session.add(exercise)

        # 🔔 Création de la notification
        notif = Notification(
            title="📝 Nouvel exercice",
            message=f"Un nouvel exercice a été ajouté : {title}",
            user_type="student"
        )

        db.session.add(notif)

        # ✅ Un seul commit (propre et atomique)
        db.session.commit()

        print("Exercise et notification créés avec succès!")

        return jsonify({
            "message": "Exercise ajouté",
            "data": exercise.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print("ERREUR EXCEPTION:")
        traceback.print_exc()
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500










# ✅ ROUTE MANQUANTE - Récupérer un exercice par ID
@exercises_bp.route('/<int:exercise_id>', methods=['GET'])
@jwt_required(optional=True)
def get_exercise(exercise_id):
    """Récupérer un exercice par son ID"""
    try:
        exercise = Exercise.query.get_or_404(exercise_id)
        return jsonify({"data": exercise.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": f"Exercice introuvable: {str(e)}"}), 404


@exercises_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required(optional=True)
def get_exercises_by_course(course_id):
    """Récupérer tous les exercices d'un cours"""
    exercises = Exercise.query.filter_by(course_id=course_id).all()
    return jsonify({"data": [e.to_dict() for e in exercises]}), 200


@exercises_bp.route('/<int:exercise_id>', methods=['PUT'])
@jwt_required()
def update_exercise(exercise_id):
    """Modifier un exercice"""
    try:
        exercise = Exercise.query.get_or_404(exercise_id)

        title = request.form.get('title')
        description = request.form.get('description')
        file = request.files.get('file')

        if title:
            exercise.title = title
        if description:
            exercise.description = description

        if file:
            filename = secure_filename(file.filename)
            upload_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(upload_path)
            exercise.pdf_file = filename

        db.session.commit()
        return jsonify({"message": "Exercise modifié", "data": exercise.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500


@exercises_bp.route('/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(exercise_id):
    """Supprimer un exercice"""
    try:
        exercise = Exercise.query.get_or_404(exercise_id)
        db.session.delete(exercise)
        db.session.commit()
        return jsonify({"message": "Exercise supprimé"}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500


# ========== ROUTE IA GÉNÉRATION EXERCICE ==========
AI_EXO_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'ai_exercises')
)

@exercises_bp.route("/ai-generate-exercise", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def ai_generate_exercise():
    """Génère un exercice IA basé sur le PDF du cours"""
    
    # Gérer OPTIONS pour CORS
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200
    
    # Traiter POST
    course_id = request.args.get("course_id")
    if not course_id:
        return jsonify({"error": "course_id requis"}), 400
    
    try:
        print(f"[IA EXERCICE] Génération pour course_id={course_id}")
        pdf_filename = generate_ai_exercise_pdf_for_course(course_id)
        
        # Retourner l'URL correcte qui correspond à la route dans __init__.py
        pdf_url = f"/ai-exercises/{pdf_filename}"
        
        print(f"[IA EXERCICE] PDF généré: {pdf_filename}")
        print(f"[IA EXERCICE] URL: {pdf_url}")
        
        return jsonify({"pdf_url": pdf_url}), 200
    except Exception as e:
        print(f"[IA EXERCICE] ERREUR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

