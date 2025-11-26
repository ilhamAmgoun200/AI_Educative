"""
Application Flask principale
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

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
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
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

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(teachers_bp, url_prefix='/api/teachers')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(subjects_bp, url_prefix='/api/subjects')
    app.register_blueprint(exercises_bp, url_prefix='/api/exercises')

    # Route pour servir les fichiers uploadés
    from flask import send_from_directory
    import os
    
    @app.route('/uploads/courses/<filename>')
    def uploaded_file(filename):
        """Servir les fichiers uploadés"""
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'courses')
        return send_from_directory(upload_folder, filename)

    # Les tables seront créées via Flask-Migrate
    # Ne pas utiliser db.create_all() en production avec PostgreSQL
    # Utiliser: flask db upgrade
    
    return app

