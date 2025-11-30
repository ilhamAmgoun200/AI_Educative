"""
Modèle CourseExplanation - Stocke les explications audio générées par l'IA
"""
from app import db
from datetime import datetime

class CourseExplanation(db.Model):
    __tablename__ = 'course_explanations'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False, index=True)
    explanation_text = db.Column(db.Text, nullable=False)  # Texte généré par l'IA
    audio_duration = db.Column(db.Integer)  # Durée en secondes (optionnel)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    course = db.relationship('Course', backref='explanations')
    student = db.relationship('Student', backref='explanations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'student_id': self.student_id,
            'explanation_text': self.explanation_text,
            'audio_duration': self.audio_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'course_title': self.course.title if self.course else None
        }
    
    def __repr__(self):
        return f'<CourseExplanation {self.id} - Course {self.course_id}>'