"""
Modèle CourseLike pour les likes/favoris des étudiants
"""
from app import db
from datetime import datetime

class CourseLike(db.Model):
    __tablename__ = 'course_likes'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Pas de relations pour l'instant - on les ajoutera après les tests

    # Contrainte d'unicité : un étudiant ne peut liker un cours qu'une seule fois
    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='unique_student_course_like'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<CourseLike student:{self.student_id} course:{self.course_id}>'