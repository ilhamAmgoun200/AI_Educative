"""
Modèle Student
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    cin = db.Column(db.String(20), unique=True)
    cne = db.Column(db.String(20), unique=True)
    birth_date = db.Column(db.Date)
    branch = db.Column(db.String(50))  # SVT, PC, SMA, SMB
    establishment = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    
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
            'cne': self.cne,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'branch': self.branch,
            'establishment': self.establishment,
            'is_active': self.is_active,
            'type': 'student',  # Ajouter le type pour le frontend
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Student {self.email}>'

