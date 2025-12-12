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
    pdf_file = db.Column(db.String(255))  # <- fichier PDF
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'pdf_file': self.pdf_file,
            'course_id': self.course_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
