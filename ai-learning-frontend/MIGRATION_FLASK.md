# Migration vers Flask - Guide de Changements

## 🔄 Changements Principaux

### 1. URL de l'API
- **Avant** : `http://localhost:1337/api`
- **Après** : `http://localhost:5000/api`
- **Fichier** : `src/config/api.js` (centralisé)

### 2. Authentification
- **Endpoint** : `/api/auth/login` (au lieu de `/api/auth/custom`)
- **Format réponse** : Identique (token + user)
- **Token** : JWT Flask (au lieu de token base64 personnalisé)

### 3. Endpoints API

#### Courses (anciennement Lessons)
- **GET** `/api/courses` - Liste des courses
  - Filtres : `?teacher_id=X&subject_id=Y&is_published=true`
  - Include : `?include_files=true&include_exercises=true`
- **GET** `/api/courses/:id` - Détails d'un course
- **POST** `/api/courses` - Créer un course
- **PUT** `/api/courses/:id` - Modifier un course
- **DELETE** `/api/courses/:id` - Supprimer un course
- **POST** `/api/courses/:id/files` - Uploader un fichier

#### Structure de données
- **Avant (Strapi)** : `{ data: { data: {...} } }`
- **Après (Flask)** : `{ data: {...} }`

### 4. Champs modifiés

#### Course
- `id` → `id` (identique)
- `documentId` → `id` (utiliser `id` directement)
- `attributes.title` → `title` (direct)
- `attributes.description` → `description` (direct)
- `course_pdf` → `files` (array d'objets)
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

#### Fichiers
- **Avant** : `course_pdf.data.attributes.url`
- **Après** : `files[].file_path` ou `/uploads/courses/{file_name}`

### 5. Composants modifiés

✅ **AuthContext.jsx**
- Endpoint : `/api/auth/login`
- Gestion d'erreurs adaptée

✅ **MyLessons.jsx**
- Endpoint : `/api/courses?teacher_id=...`
- Structure de données adaptée
- Utilisation de `id` au lieu de `documentId`

✅ **CreateLesson.jsx**
- Endpoint : `/api/courses`
- Upload : `/api/courses/:id/files`
- Format FormData simplifié

✅ **EditLesson.jsx**
- Endpoint : `/api/courses/:id`
- Upload : `/api/courses/:id/files`
- Structure de données adaptée

✅ **ViewLesson.jsx**
- Endpoint : `/api/courses/:id?include_files=true`
- Affichage des fichiers adapté

✅ **DashboardTeacher.jsx**
- Endpoint : `/api/courses?teacher_id=...`
- Structure de données adaptée

## 🚀 Démarrage

1. **Démarrer Flask** :
   ```bash
   cd ai-platform-backend-flask
   python run.py
   ```

2. **Démarrer React** :
   ```bash
   cd ai-learning-frontend
   npm start
   ```

3. **Tester la connexion** :
   - Email : `teacher@test.com`
   - Password : `password123`
   - UserType : `teacher`

## ⚠️ Notes Importantes

- Les fichiers uploadés sont dans `uploads/courses/`
- Les URLs de fichiers : `http://localhost:5000/uploads/courses/{filename}`
- Le token JWT expire après 24h
- Tous les endpoints nécessitent le header : `Authorization: Bearer <token>`

