"""
Modèle Subject
"""
from app import db
from datetime import datetime

class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    subject_name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    level = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    courses = db.relationship('Course', backref='subject', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            'id': self.id,
            'subject_name': self.subject_name,
            'description': self.description,
            'level': self.level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Subject {self.subject_name}>'

