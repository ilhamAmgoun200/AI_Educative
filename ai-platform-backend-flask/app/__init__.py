"""
Application Flask principale
"""
from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
import os



# Initialisation des extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    """Factory function pour créer l'application Flask"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialiser les extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configuration CORS plus permissive
    cors.init_app(app, 
        resources={r"/*": {  # Permet TOUS les endpoints
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }}
    )

    
    # === 📌 ICI : ROUTE POUR SERVIR PDF IA ===
    AI_EXO_DIR = os.path.join(os.path.dirname(__file__), "uploads", "ai_exercises")

    @app.route('/ai-exercises/<path:filename>')
    def serve_ai_exercise(filename):
        return send_from_directory(AI_EXO_DIR, filename)
    
    # Handlers d'erreur JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token expiré'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': f'Token invalide: {str(error)}'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Token manquant'}), 401

    # Enregistrer les blueprints
    from app.routes.auth import auth_bp
    from app.routes.teachers import teachers_bp
    from app.routes.students import students_bp
    from app.routes.courses import courses_bp
    from app.routes.subjects import subjects_bp
    from app.routes.exercises import exercises_bp
    from app.routes.ai_explanations import ai_explanations_bp
    from app.routes.student_progress import progress_bp
    from app.routes.chat_routes import chat_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(teachers_bp, url_prefix='/api/teachers')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(subjects_bp, url_prefix='/api/subjects')
    app.register_blueprint(exercises_bp, url_prefix='/api/exercises')
    app.register_blueprint(ai_explanations_bp, url_prefix='/api/ai')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    # Route pour servir les fichiers uploadés
    @app.route('/uploads/courses/<filename>')
    def uploaded_courses_file(filename):
        """Servir les fichiers de cours uploadés"""
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'courses')
        return send_from_directory(upload_folder, filename)
    
    @app.route('/uploads/exercises/<filename>')
    def uploaded_exercises_file(filename):
        """Servir les fichiers d'exercices uploadés"""
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'exercises')
        return send_from_directory(upload_folder, filename)
    
    @app.route('/uploads/ai_exercises/<filename>')
    def uploaded_ai_exercises_file(filename):
        """Servir les exercices générés par IA"""
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'ai_exercises')
        return send_from_directory(upload_folder, filename)
    
    return app