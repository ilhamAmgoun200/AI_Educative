from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import io
import os
from app import db
from app.models.course import Course
from app.models.course_explanation import CourseExplanation
from app.services.openai_service import generate_course_explanation, text_to_speech
import PyPDF2

ai_explanations_bp = Blueprint('ai_explanations', __name__)

def extract_pdf_text(pdf_path):
    """Extraire le texte d'un fichier PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"[ERROR] Extraction PDF: {str(e)}")
        return None


@ai_explanations_bp.route('/courses/<int:course_id>/generate-explanation', methods=['POST'])
@jwt_required()
def generate_explanation(course_id):
    """Générer une explication IA pour un cours"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Seuls les étudiants peuvent demander des explications'}), 403
        
        student_id = int(get_jwt_identity())
        
        # Récupérer le cours avec ses fichiers
        course = Course.query.get_or_404(course_id)
        
        # ✅ NOUVEAU : Vérifier si on veut forcer une nouvelle génération
        force_new = request.json.get('force_new', False) if request.json else False
        
        # Vérifier si une explication existe déjà
        existing_explanation = CourseExplanation.query.filter_by(
            course_id=course_id,
            student_id=student_id
        ).order_by(CourseExplanation.created_at.desc()).first()
        
        # ✅ Si une explication existe et qu'on ne force pas, la retourner
        if existing_explanation and not force_new:
            return jsonify({
                'message': 'Explication déjà existante',
                'data': existing_explanation.to_dict()
            }), 200
        
        # ✅ EXTRACTION DU CONTENU PDF
        pdf_content = None
        
        # Convertir en liste pour pouvoir utiliser len()
        course_files = list(course.files) if course.files else []
        
        if course_files:
            # Prendre le premier PDF
            first_pdf = course_files[0]
            pdf_path = os.path.join('app/uploads/courses', first_pdf.file_name)
            
            if os.path.exists(pdf_path):
                print(f"[INFO] Extraction du PDF: {pdf_path}")
                pdf_content = extract_pdf_text(pdf_path)
                print(f"[INFO] Contenu extrait: {len(pdf_content) if pdf_content else 0} caractères")
            else:
                print(f"[WARNING] PDF non trouvé: {pdf_path}")
        else:
            print(f"[WARNING] Aucun fichier PDF trouvé pour le cours {course_id}")
        
        # Générer l'explication avec le contenu du PDF
        print(f"[INFO] Génération de l'explication pour le cours {course_id}")
        explanation_text = generate_course_explanation(
            course_title=course.title,
            course_description=course.description or "Pas de description disponible",
            pdf_content=pdf_content  # ✅ PASSER LE CONTENU DU PDF
        )
        
        # ✅ Toujours créer une NOUVELLE entrée (pour l'historique)
        explanation = CourseExplanation(
            course_id=course_id,
            student_id=student_id,
            explanation_text=explanation_text
        )
        
        db.session.add(explanation)
        db.session.commit()
        
        return jsonify({
            'message': 'Nouvelle explication générée avec succès' if force_new else 'Explication générée avec succès',
            'data': explanation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()  # Pour voir l'erreur complète
        return jsonify({'error': str(e)}), 500


@ai_explanations_bp.route('/courses/<int:course_id>/explanation', methods=['GET'])
@jwt_required()
def get_explanation(course_id):
    """Récupérer la dernière explication d'un cours pour l'étudiant connecté"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        # ✅ Récupérer la dernière explication
        explanation = CourseExplanation.query.filter_by(
            course_id=course_id,
            student_id=student_id
        ).order_by(CourseExplanation.created_at.desc()).first()
        
        if not explanation:
            return jsonify({'message': 'Aucune explication trouvée'}), 404
        
        return jsonify({
            'data': explanation.to_dict()
        }), 200
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500


# ✅ NOUVELLE ROUTE : Historique des explications pour un cours spécifique
@ai_explanations_bp.route('/courses/<int:course_id>/explanations-history', methods=['GET'])
@jwt_required()
def get_course_explanations_history(course_id):
    """Récupérer l'historique des explications pour un cours"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        # Récupérer toutes les explications de ce cours pour cet étudiant
        explanations = CourseExplanation.query.filter_by(
            course_id=course_id,
            student_id=student_id
        ).order_by(CourseExplanation.created_at.desc()).all()
        
        return jsonify({
            'data': [exp.to_dict() for exp in explanations],
            'count': len(explanations)
        }), 200
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500


@ai_explanations_bp.route('/courses/<int:course_id>/explanation/audio', methods=['GET'])
@jwt_required()
def get_explanation_audio(course_id):
    """Générer et retourner l'audio de l'explication actuelle"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        # ✅ Récupérer la dernière explication
        explanation = CourseExplanation.query.filter_by(
            course_id=course_id,
            student_id=student_id
        ).order_by(CourseExplanation.created_at.desc()).first()
        
        if not explanation:
            return jsonify({'error': 'Aucune explication trouvée. Générez-en une d\'abord.'}), 404
        
        # Générer l'audio
        audio_content = text_to_speech(explanation.explanation_text)
        
        # Retourner l'audio
        return send_file(
            io.BytesIO(audio_content),
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=f'explanation_course_{course_id}.mp3'
        )
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500


# ✅ NOUVELLE ROUTE : Audio pour une explication spécifique de l'historique
@ai_explanations_bp.route('/explanations/<int:explanation_id>/audio', methods=['GET'])
@jwt_required()
def get_specific_explanation_audio(explanation_id):
    """Générer et retourner l'audio d'une explication spécifique"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        # Récupérer l'explication et vérifier qu'elle appartient à l'étudiant
        explanation = CourseExplanation.query.filter_by(
            id=explanation_id,
            student_id=student_id
        ).first()
        
        if not explanation:
            return jsonify({'error': 'Explication introuvable'}), 404
        
        # Générer l'audio
        audio_content = text_to_speech(explanation.explanation_text)
        
        # Retourner l'audio
        return send_file(
            io.BytesIO(audio_content),
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=f'explanation_{explanation_id}.mp3'
        )
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500




@ai_explanations_bp.route('/explanations/<int:explanation_id>', methods=['DELETE'])
@jwt_required()
def delete_explanation(explanation_id):
    """Supprimer une explication spécifique de l'historique"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        # Récupérer l'explication et vérifier qu'elle appartient à l'étudiant
        explanation = CourseExplanation.query.filter_by(
            id=explanation_id,
            student_id=student_id
        ).first()
        
        if not explanation:
            return jsonify({'error': 'Explication introuvable'}), 404
        
        course_id = explanation.course_id
        
        # Supprimer l'explication
        db.session.delete(explanation)
        db.session.commit()
        
        return jsonify({
            'message': 'Explication supprimée avec succès',
            'course_id': course_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_explanations_bp.route('/explanations/my-explanations', methods=['GET'])
@jwt_required()
def get_my_explanations():
    """Récupérer toutes les explications de l'étudiant connecté (tous les cours)"""
    try:
        claims = get_jwt()
        if claims.get('user_type') != 'student':
            return jsonify({'error': 'Accès refusé'}), 403
        
        student_id = int(get_jwt_identity())
        
        explanations = CourseExplanation.query.filter_by(
            student_id=student_id
        ).order_by(CourseExplanation.created_at.desc()).all()
        
        return jsonify({
            'data': [exp.to_dict() for exp in explanations],
            'count': len(explanations)
        }), 200
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    