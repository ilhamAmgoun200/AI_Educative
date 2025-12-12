"""
Service IA pour générer des explications de cours avec Google Gemini
"""
import os
from google import genai

GEMINI_API_KEY = "AIzaSyCuYIYzJdrmmrU20BpU4rTT-pjgIwxeSzc"

def generate_course_explanation(course_title, course_description, pdf_content=None):
    """
    Génère une explication de cours avec Google Gemini.
    """
    
    if pdf_content:
        # Limiter à 8000 caractères pour ne pas dépasser les limites
        pdf_content = pdf_content[:8000]
        prompt = f"""Tu es un professeur expert qui explique des cours de manière claire et pédagogique.

📚 **Cours:** {course_title}
📝 **Description:** {course_description}

📄 **CONTENU DU DOCUMENT PDF À EXPLIQUER:**
{pdf_content}

**CONSIGNE IMPORTANTE:** 
- Base ton explication UNIQUEMENT sur le contenu du PDF ci-dessus
- Explique les concepts clés présents dans le document
- Structure ton explication de manière pédagogique
- Utilise des exemples du document
- Ton explication doit durer 3-5 minutes à l'oral
- Adopte un ton professoral, clair et encourageant"""
    else:
        prompt = f"""Tu es un professeur expert qui explique des cours de manière claire et pédagogique.

Cours: {course_title}
Description: {course_description}

⚠️ Aucun document PDF n'est disponible pour ce cours.
Fais une explication générale basée sur le titre et la description du cours.
L'explication doit être structurée, claire et accessible pour un étudiant."""

    try:
        # Initialiser le client Gemini avec la clé API
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Générer le contenu avec le modèle Gemini 2.5 Flash
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        explanation = response.text
        return explanation
            
    except Exception as e:
        print(f"[ERROR] Erreur lors de l'appel Gemini: {str(e)}")
        raise Exception(f"Impossible de générer l'explication: {str(e)}")


def text_to_speech(text):
    """
    Génère l'audio avec gTTS (Google Text-to-Speech - gratuit)
    """
    try:
        from gtts import gTTS
        import io
        
        # Générer l'audio avec gTTS (gratuit, utilise Google TTS)
        tts = gTTS(text=text, lang='fr', slow=False)
        
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        return audio_buffer.read()
        
    except ImportError:
        raise Exception("gTTS n'est pas installé. Installez-le avec: pip install gtts")
    except Exception as e:
        print(f"[ERROR] Erreur TTS: {str(e)}")
        raise Exception(f"Impossible de générer l'audio: {str(e)}")