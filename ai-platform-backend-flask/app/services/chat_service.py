from groq import Groq
from app import db
from app.models.chat_message import ChatMessage
from app.models.course import Course
from app.models.student import Student
from sqlalchemy import desc
from dotenv import load_dotenv
import os

Groq_API_KEY = os.getenv("Groq_API_KEY")
class ChatService:
    def __init__(self):
        if not Groq_API_KEY:
            raise ValueError("GROQ_API_KEY manquante")

        self.client = Groq(api_key=Groq_API_KEY)
        self.model = "llama-3.1-8b-instant"   # modèle validé Groq

    def send_message(self, user_id, course_id, message):
        """Enregistrer le message user, générer réponse IA, sauvegarder, retourner dict"""
        
        user = Student.query.get(user_id)
        if not user:
            raise ValueError("Utilisateur non trouvé")

        course = Course.query.get(course_id)
        if not course:
            raise ValueError("Cours non trouvé")

        # 1. Sauvegarde du message utilisateur
        user_message = ChatMessage(
            user_id=user_id,
            course_id=course_id,
            message=message,
            is_ai=False
        )
        db.session.add(user_message)
        db.session.flush()

        # 2. Récupération du contexte
        history = self._get_recent_history(user_id, course_id, limit=8)

        # 3. Génération IA
        ai_response = self._generate_ai_response(
            message=message,
            course_title=course.title,
            course_description=course.description or "",
            history=history
        )

        # 4. Sauvegarde réponse IA
        ai_message = ChatMessage(
            user_id=user_id,
            course_id=course_id,
            message=ai_response,
            is_ai=True
        )
        db.session.add(ai_message)
        db.session.commit()

        return {
            "user_message": user_message.to_dict(),
            "ai_message": ai_message.to_dict()
        }

    def _get_recent_history(self, user_id, course_id, limit=10):
        """Retourner historique dans l'ordre chronologique réel"""
        messages = ChatMessage.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).order_by(desc(ChatMessage.created_at)).limit(limit).all()

        return list(reversed(messages))

    def _generate_ai_response(self, message, course_title, course_description, history):
        """Appel API Groq pour générer la réponse IA"""

        # Construire le prompt
        messages = [
            {
                "role": "system",
                "content": f"""Tu es un assistant IA pédagogique expert.

Cours : {course_title}
Description : {course_description}

Règles :
- Réponds TOUJOURS en français
- Explique clairement, avec des exemples simples
- Adapte-toi au niveau d’un étudiant
"""
            }
        ]

        # Ajouter historique
        for msg in history:
            messages.append({
                "role": "assistant" if msg.is_ai else "user",
                "content": msg.message
            })

        # Ajouter message actuel
        messages.append({"role": "user", "content": message})

        # Appel Groq
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print("Erreur Groq :", e)
            return "Une erreur technique s’est produite. Réessaie dans un instant."




    def get_chat_history(self, user_id, course_id, limit=50, offset=0):
        messages = ChatMessage.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).order_by(ChatMessage.created_at).limit(limit).offset(offset).all()

        return [msg.to_dict() for msg in messages]

    def clear_chat_history(self, user_id, course_id):
        deleted = ChatMessage.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).delete()

        db.session.commit()
        return deleted

    def get_chat_stats(self, user_id, course_id):
        total = ChatMessage.query.filter_by(user_id=user_id, course_id=course_id).count()
        user_msg = ChatMessage.query.filter_by(user_id=user_id, course_id=course_id, is_ai=False).count()
        ai_msg = ChatMessage.query.filter_by(user_id=user_id, course_id=course_id, is_ai=True).count()

        return {
            "total_messages": total,
            "user_messages": user_msg,
            "ai_messages": ai_msg
        }
