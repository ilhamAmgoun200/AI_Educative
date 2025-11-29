# app/services/__init__.py
"""
Services pour l'application
"""
from app.services.openai_service import generate_course_explanation, text_to_speech
__all__ = ['generate_course_explanation', 'text_to_speech']