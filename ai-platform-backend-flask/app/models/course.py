"""
Modèles Course et CourseFile
"""
from app import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    video_url = db.Column(db.Text)
    order_no = db.Column(db.Integer)
    is_published = db.Column(db.Boolean, default=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    files = db.relationship('CourseFile', backref='course', lazy='dynamic', cascade='all, delete-orphan')
    exercises = db.relationship('Exercise', backref='course', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_files=False, include_exercises=False, include_teacher=False):
        """Convertir en dictionnaire"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'video_url': self.video_url,
            'order_no': self.order_no,
            'is_published': self.is_published,
            'teacher_id': self.teacher_id,
            'subject_id': self.subject_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_files:
            data['files'] = [file.to_dict() for file in self.files]
            # Pour compatibilité avec le frontend
            if data['files']:
                data['course_pdf_url'] = data['files'][0]['file_name']

        if include_teacher and self.teacher:
            data['teacher'] = {
                'id': self.teacher.id,
                'first_name': self.teacher.first_name,
                'last_name': self.teacher.last_name,
                'email': self.teacher.email
            }

        if include_exercises:
            data['exercises'] = [exercise.to_dict() for exercise in self.exercises]

        return data

    def __repr__(self):
        return f'<Course {self.title}>'


class CourseFile(db.Model):
    __tablename__ = 'course_files'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            'id': self.id,
            'course_id': self.course_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<CourseFile {self.file_name}>'

