"""
Script pour initialiser la base de données avec des données de test
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.subject import Subject
from app.models.course import Course

app = create_app()

with app.app_context():
    # Créer les tables (si elles n'existent pas)
    # Note: En production, utilisez Flask-Migrate: flask db upgrade
    try:
        db.create_all()
        print("[OK] Tables creees ou deja existantes")
    except Exception as e:
        print(f"[WARNING] Erreur lors de la creation des tables: {e}")
        print("[INFO] Assurez-vous d'avoir execute: flask db upgrade")

    # Créer des subjects
    subjects_data = [
        {'subject_name': 'Mathématiques', 'description': 'Cours de mathématiques', 'level': 'Bac'},
        {'subject_name': 'Physique', 'description': 'Cours de physique', 'level': 'Bac'},
        {'subject_name': 'SVT', 'description': 'Sciences de la Vie et de la Terre', 'level': 'Bac'},
        {'subject_name': 'Arabe', 'description': 'Langue arabe', 'level': 'Bac'},
        {'subject_name': 'Français', 'description': 'Langue française', 'level': 'Bac'},
        {'subject_name': 'Philosophie', 'description': 'Cours de philosophie', 'level': 'Bac'},
        {'subject_name': 'Anglais', 'description': 'English language', 'level': 'Bac'},
    ]

    for subj_data in subjects_data:
        existing = Subject.query.filter_by(subject_name=subj_data['subject_name']).first()
        if not existing:
            subject = Subject(**subj_data)
            db.session.add(subject)

    db.session.commit()
    print("[OK] Subjects crees")

    # Créer un teacher de test
    teacher = Teacher.query.filter_by(email='teacher@test.com').first()
    if not teacher:
        teacher = Teacher(
            first_name='John',
            last_name='Doe',
            email='teacher@test.com',
            phone='0612345678',
            cin='AB123456',
            subject_id=1,  # Mathématiques
            establishment='Lycee Test',
            experience_years=5,
            is_active=True
        )
        teacher.set_password('password123')
        db.session.add(teacher)
        db.session.commit()
        print("[OK] Teacher de test cree (email: teacher@test.com, password: password123)")

    # Créer un student de test
    student = Student.query.filter_by(email='student@test.com').first()
    if not student:
        student = Student(
            first_name='Jane',
            last_name='Smith',
            email='student@test.com',
            phone='0698765432',
            cin='CD789012',
            cne='ST123456',
            branch='SVT',
            establishment='Lycee Test',
            is_active=True
        )
        student.set_password('password123')
        db.session.add(student)
        db.session.commit()
        print("[OK] Student de test cree (email: student@test.com, password: password123)")

    print("\n[SUCCESS] Base de donnees initialisee avec succes!")

