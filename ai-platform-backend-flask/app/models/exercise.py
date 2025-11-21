"""
Modèle Exercise
"""
from app import db
from datetime import datetime
import json
from sqlalchemy.dialects.postgresql import JSON

class Exercise(db.Model):
    __tablename__ = 'exercises'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    questions = db.Column(JSON, nullable=False)
    answers = db.Column(JSON)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), index=True)
    score = db.Column(db.Numeric(5, 2))
    attempt_number = db.Column(db.Integer, default=1)
    feedback = db.Column(db.Text)
    attempt_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'questions': self.questions,
            'answers': self.answers,
            'course_id': self.course_id,
            'student_id': self.student_id,
            'score': float(self.score) if self.score else None,
            'attempt_number': self.attempt_number,
            'feedback': self.feedback,
            'attempt_at': self.attempt_at.isoformat() if self.attempt_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Exercise {self.title}>'

