"""
Configuration de l'application Flask
"""
import os
from datetime import timedelta

class Config:
    """Configuration de base"""

    # 👉 Connexion directe à ta base Neon PostgreSQL
    SQLALCHEMY_DATABASE_URI = (
        "postgresql://neondb_owner:npg_pIUyVdvD7m0A"
        "@ep-curly-credit-ahekug2m-pooler.c-3.us-east-1.aws.neon.tech"
        ":5432/neondb?sslmode=require"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_ALGORITHM = 'HS256'

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}

    # CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'https://ai-educative-1344-5g6z.onrender.com']
