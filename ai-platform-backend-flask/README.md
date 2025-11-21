# Backend Flask - AI Learning Platform

## 🚀 Installation

### 1. Créer un environnement virtuel

```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Installer PostgreSQL

Assurez-vous que PostgreSQL est installé et en cours d'exécution.

**Windows** : Télécharger depuis https://www.postgresql.org/download/windows/
**Linux** : `sudo apt-get install postgresql postgresql-contrib`
**Mac** : `brew install postgresql`

### 4. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE aiplatform;

# Créer un utilisateur (optionnel)
CREATE USER aiplatform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aiplatform TO aiplatform_user;

# Quitter
\q
```

### 5. Configurer les variables d'environnement

Créer un fichier `.env` :

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiplatform
DB_USER=postgres
DB_PASSWORD=postgres

# Ou utiliser DATABASE_URL directement
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aiplatform

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

### 6. Initialiser la base de données

```bash
# Initialiser les migrations
flask db init

# Créer la première migration
flask db migrate -m "Initial migration"

# Appliquer les migrations
flask db upgrade

# Ou initialiser avec des données de test
python scripts/init_db.py
```

### 7. Lancer l'application

```bash
python run.py
```

L'API sera disponible sur `http://localhost:5000`

## 📚 Structure du Projet

```
ai-platform-backend-flask/
├── app/
│   ├── __init__.py          # Factory de l'application
│   ├── models/              # Modèles SQLAlchemy
│   │   ├── teacher.py
│   │   ├── student.py
│   │   ├── subject.py
│   │   ├── course.py
│   │   └── exercise.py
│   └── routes/              # Routes API
│       ├── auth.py
│       ├── teachers.py
│       ├── students.py
│       ├── courses.py
│       ├── subjects.py
│       └── exercises.py
├── config.py                # Configuration
├── run.py                   # Point d'entrée
└── requirements.txt          # Dépendances
```

## 🔐 Authentification

### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "userType": "teacher"
}
```

Réponse :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "teacher@example.com",
    ...
  },
  "userType": "teacher"
}
```

### Utiliser le token

```http
GET /api/courses
Authorization: Bearer <token>
```

## 📋 Endpoints API

### Auth
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel

### Teachers
- `GET /api/teachers` - Liste des teachers
- `GET /api/teachers/<id>` - Détails d'un teacher
- `GET /api/teachers/me` - Teacher actuel
- `PUT /api/teachers/me` - Modifier le teacher actuel

### Students
- `GET /api/students` - Liste des students
- `GET /api/students/<id>` - Détails d'un student
- `GET /api/students/me` - Student actuel
- `PUT /api/students/me` - Modifier le student actuel

### Courses
- `GET /api/courses` - Liste des courses (filtres: teacher_id, subject_id, is_published)
- `GET /api/courses/<id>` - Détails d'un course
- `POST /api/courses` - Créer un course (teacher)
- `PUT /api/courses/<id>` - Modifier un course (propriétaire)
- `DELETE /api/courses/<id>` - Supprimer un course (propriétaire)
- `POST /api/courses/<id>/files` - Uploader un fichier (propriétaire)

### Subjects
- `GET /api/subjects` - Liste des subjects
- `GET /api/subjects/<id>` - Détails d'un subject
- `POST /api/subjects` - Créer un subject (admin)
- `PUT /api/subjects/<id>` - Modifier un subject (admin)
- `DELETE /api/subjects/<id>` - Supprimer un subject (admin)

### Exercises
- `GET /api/exercises` - Liste des exercises (filtres: course_id, student_id)
- `GET /api/exercises/<id>` - Détails d'un exercise
- `POST /api/exercises` - Créer un exercise
- `PUT /api/exercises/<id>` - Modifier un exercise
- `DELETE /api/exercises/<id>` - Supprimer un exercise

## 🔒 Permissions

- **Public** : GET sur courses, subjects, teachers, students
- **Teacher** : CRUD sur ses propres courses, upload fichiers
- **Student** : CRUD sur ses propres exercises
- **Admin** : CRUD sur subjects (à implémenter)

## 📝 Notes

- Les mots de passe sont hashés avec Werkzeug
- Les tokens JWT expirent après 24h
- Les fichiers uploadés sont stockés dans `uploads/courses/`
- **Base de données PostgreSQL** : `aiplatform`
- Le pool de connexions est configuré pour PostgreSQL
- Les migrations sont gérées par Flask-Migrate

