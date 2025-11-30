from app import db
from datetime import datetime

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    
    # Contenu du message
    message = db.Column(db.Text, nullable=False)
    is_ai = db.Column(db.Boolean, default=False, nullable=False)
    
    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relations ORM (CORRIGÉ : Student au lieu de User)
    user = db.relationship('Student', backref='chat_messages', lazy=True)
    course = db.relationship('Course', backref='chat_messages', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'message': self.message,
            'is_ai': self.is_ai,
            'created_at': self.created_at.isoformat(),
            'user': {
                'id': self.user.id,
                'name': f"{self.user.first_name} {self.user.last_name}",
                'email': self.user.email,
                'type': 'student'
            } if self.user else None
        }

    def __repr__(self):
        return f"<ChatMessage {self.id}>"