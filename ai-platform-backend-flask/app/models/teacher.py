"""
Modèle Teacher
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Teacher(db.Model):
    __tablename__ = 'teachers'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    cin = db.Column(db.String(20), unique=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    establishment = db.Column(db.String(255))
    experience_years = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    subject = db.relationship('Subject', backref='teachers')
    courses = db.relationship('Course', backref='teacher', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hasher le mot de passe"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Vérifier le mot de passe"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'cin': self.cin,
            'subject_id': self.subject_id,
            'establishment': self.establishment,
            'experience_years': self.experience_years,
            'is_active': self.is_active,
            'type': 'teacher',  # Ajouter le type pour le frontend
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Teacher {self.email}>'

