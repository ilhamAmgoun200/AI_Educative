import os
import uuid
from PyPDF2 import PdfReader
from fpdf import FPDF
from app.models.course import Course
from app import db
from google import genai

# Utiliser la clé Gemini
GEMINI_API_KEY = "AIzaSyCuYIYzJdrmmrU20BpU4rTT-pjgIwxeSzc"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES_DIR = os.path.join(BASE_DIR, "uploads", "courses")
AI_EXO_DIR = os.path.join(BASE_DIR, "uploads", "ai_exercises")
os.makedirs(AI_EXO_DIR, exist_ok=True)

def extract_text_from_pdf(pdf_path, max_pages=5):
    """Extrait le texte d'un PDF"""
    txt = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages[:max_pages]:
            txt += page.extract_text() or ""
    except Exception as e:
        print(f"[ERREUR] Extraction PDF: {e}")
    return txt

def generate_exercise_with_ai(course_text):
    """Génère des exercices avec Google Gemini"""
    
    prompt = f"""Tu es un professeur qui crée des exercices pédagogiques en français.

📄 **CONTENU DU COURS À ANALYSER:**
{course_text[:4000]}

**CONSIGNE:**
Crée exactement 2 exercices basés sur ce contenu de cours.

**FORMAT ATTENDU:**

Exercice 1: [Titre de l'exercice 1]
[Énoncé détaillé avec 3-4 questions ou consignes précises]

Exercice 2: [Titre de l'exercice 2]
[Énoncé détaillé avec 3-4 questions ou consignes précises]

Les exercices doivent:
- Tester la compréhension des concepts clés du cours
- Être progressifs (exercice 1 plus simple, exercice 2 plus avancé)
- Inclure des consignes claires et précises
- Être réalisables en 15-20 minutes chacun
"""
    
    try:
        # Initialiser le client Gemini
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Générer les exercices avec Gemini 2.5 Flash
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        return response.text
            
    except Exception as e:
        print(f"[ERROR] Erreur Gemini: {str(e)}")
        # Fallback en cas d'erreur
        return f"""Exercice 1: Questions de compréhension
Basé sur le contenu du cours, répondez aux questions suivantes:
1. Quel est le sujet principal abordé dans ce cours?
2. Quels sont les 3 concepts clés présentés?
3. Donnez un exemple d'application pratique de ce qui a été enseigné.
4. Expliquez avec vos propres mots le concept le plus important.

Exercice 2: Mise en pratique
Créez un mini-projet ou une étude de cas qui démontre votre compréhension du cours.

Consignes:
- Utilisez au moins 2 des concepts vus en cours
- Documentez votre démarche étape par étape
- Présentez vos résultats de manière structurée
- Justifiez vos choix techniques ou méthodologiques

Note: Exercices générés automatiquement (contenu analysé: {len(course_text)} caractères)"""

def export_exercise_to_pdf(text, pdf_path):
    """Exporte le texte en PDF avec support UTF-8"""
    from fpdf import FPDF
    
    class UTF8_FPDF(FPDF):
        def __init__(self):
            super().__init__()
            # Ajouter la police DejaVu pour support UTF-8
            self.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', uni=True)
    
    try:
        pdf = UTF8_FPDF()
        pdf.add_page()
        pdf.set_font('DejaVu', size=12)
        
        # Nettoyer et encoder le texte
        for line in text.splitlines():
            if line.strip():
                try:
                    pdf.multi_cell(0, 10, line)
                except Exception as e:
                    # Fallback: remplacer les caractères problématiques
                    clean_line = line.encode('ascii', 'ignore').decode('ascii')
                    pdf.multi_cell(0, 10, clean_line)
        
        pdf.output(pdf_path)
        
    except Exception as e:
        print(f"[ERROR] Erreur export PDF avec DejaVu: {e}")
        # Fallback: utiliser Arial avec remplacement de caractères
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        for line in text.splitlines():
            if line.strip():
                # Remplacer caractères spéciaux
                clean_line = line.replace('é', 'e').replace('è', 'e').replace('à', 'a')
                clean_line = clean_line.replace('ê', 'e').replace('ô', 'o').replace('û', 'u')
                clean_line = clean_line.replace('ç', 'c').replace('É', 'E').replace('À', 'A')
                try:
                    pdf.multi_cell(0, 10, clean_line)
                except:
                    pass
        
        pdf.output(pdf_path)

def generate_ai_exercise_pdf_for_course(course_id):
    """Génère un PDF d'exercices pour un cours"""
    
    # 1. Récupérer le cours depuis la DB
    course = Course.query.get(course_id)
    if not course:
        raise FileNotFoundError(f"Cours ID {course_id} introuvable dans la base de données")
    
    print(f"[DEBUG] Cours trouvé: {course.title}")
    
    # 2. Récupérer les fichiers (course.files est une query dynamique, pas une liste !)
    files_list = course.files.all()  # ← IMPORTANT : appeler .all() pour obtenir la liste
    print(f"[DEBUG] Nombre de fichiers: {len(files_list)}")
    
    if not files_list:
        print(f"[DEBUG] Aucun fichier dans la DB, recherche dans le dossier...")
        # Fallback : chercher dans le dossier uploads/courses
        if os.path.exists(COURSES_DIR):
            all_files = os.listdir(COURSES_DIR)
            print(f"[DEBUG] Fichiers dans {COURSES_DIR}: {all_files}")
            
            # Chercher tous les PDF (peu importe le format du nom)
            pdf_files = [f for f in all_files if f.endswith('.pdf')]
            print(f"[DEBUG] PDF trouvés: {pdf_files}")
            
            if not pdf_files:
                raise FileNotFoundError(f"Aucun PDF trouvé pour le cours ID {course_id}")
            
            # Prendre le premier PDF trouvé
            course_pdf_name = pdf_files[0]
            course_pdf_path = os.path.join(COURSES_DIR, course_pdf_name)
        else:
            raise FileNotFoundError(f"Le dossier {COURSES_DIR} n'existe pas")
    else:
        # Utiliser le premier fichier de la DB
        course_pdf_name = files_list[0].file_name
        course_pdf_path = os.path.join(COURSES_DIR, course_pdf_name)
        print(f"[DEBUG] Fichier depuis DB: {course_pdf_name}")
    
    print(f"[DEBUG] Fichier PDF: {course_pdf_name}")
    print(f"[DEBUG] Chemin complet: {course_pdf_path}")
    print(f"[DEBUG] Existe? {os.path.exists(course_pdf_path)}")
    
    if not os.path.exists(course_pdf_path):
        raise FileNotFoundError(f"PDF '{course_pdf_name}' introuvable dans {COURSES_DIR}")
    
    # 4. Extraire le texte du PDF
    print("[DEBUG] Extraction du texte du PDF...")
    texte = extract_text_from_pdf(course_pdf_path)
    
    if not texte or len(texte.strip()) < 50:
        raise ValueError("Le PDF ne contient pas assez de texte pour générer des exercices")
    
    print(f"[DEBUG] Texte extrait: {len(texte)} caractères")
    
    # 5. Générer exercices avec IA
    print("[DEBUG] Génération des exercices avec OpenAI...")
    ai_text = generate_exercise_with_ai(texte)
    
    # 6. Exporter en PDF
    out_name = f"exercise_{course_id}_{uuid.uuid4().hex[:8]}.pdf"
    out_path = os.path.join(AI_EXO_DIR, out_name)
    
    print(f"[DEBUG] Export vers: {out_path}")
    export_exercise_to_pdf(ai_text, out_path)
    
    print(f"[SUCCESS] Exercice généré: {out_name}")
    
    # Retourner seulement le nom du fichier (pas l'URL complète)
    return out_name