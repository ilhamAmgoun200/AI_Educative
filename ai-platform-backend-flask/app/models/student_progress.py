"""
Modèle StudentProgress - Suivi de la progression des étudiants
"""
from app import db
from datetime import datetime

class StudentProgress(db.Model):
    __tablename__ = 'student_progress'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    last_viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    student = db.relationship('Student', backref=db.backref('progress', lazy='dynamic'))
    course = db.relationship('Course', backref=db.backref('student_progress', lazy='dynamic'))

    # Contrainte unique pour éviter les doublons
    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='unique_student_course_progress'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'last_viewed_at': self.last_viewed_at.isoformat() if self.last_viewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<StudentProgress student={self.student_id} course={self.course_id}>'