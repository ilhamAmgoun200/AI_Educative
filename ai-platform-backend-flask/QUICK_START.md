# 🚀 Guide de Démarrage Rapide - PostgreSQL

## Option 1 : Docker (Le Plus Simple) ⭐

```bash
cd ai-platform-backend-flask
docker-compose up -d
```

C'est tout ! PostgreSQL et Flask démarrent automatiquement.

## Option 2 : Installation Manuelle

### 1. Installer PostgreSQL

**Windows** :
- Télécharger : https://www.postgresql.org/download/windows/
- Installer avec l'installateur
- Noter le mot de passe du superutilisateur `postgres`

**Linux** :
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Mac** :
```bash
brew install postgresql
brew services start postgresql
```

### 2. Créer la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE aiplatform;

# Quitter
\q
```

### 3. Configurer l'Environnement

```bash
cd ai-platform-backend-flask

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiplatform
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True
EOF
```

**⚠️ Important** : Modifiez `DB_PASSWORD` dans `.env` avec votre mot de passe PostgreSQL !

### 4. Initialiser la Base de Données

```bash
# Initialiser les migrations
flask db init

# Créer la première migration
flask db migrate -m "Initial migration"

# Appliquer les migrations (créer les tables)
flask db upgrade

# Ajouter des données de test
python scripts/init_db.py
```

### 5. Démarrer le Serveur

```bash
python run.py
```

Le serveur sera disponible sur `http://localhost:5000`

## ✅ Vérification

### Tester la connexion

```bash
# Vérifier que les tables existent
psql -U postgres -d aiplatform -c "\dt"
```

Vous devriez voir :
- teachers
- students
- subjects
- courses
- course_files
- exercises

### Tester l'API

```bash
# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@test.com",
    "password": "password123",
    "userType": "teacher"
  }'
```

## 🔧 Dépannage

### Erreur : "could not connect to server"

**Solution** : Vérifier que PostgreSQL est démarré
```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Mac
brew services list
brew services start postgresql
```

### Erreur : "password authentication failed"

**Solution** : Vérifier le mot de passe dans `.env`
- Le mot de passe par défaut est celui défini lors de l'installation de PostgreSQL
- Ou modifier `.env` avec le bon mot de passe

### Erreur : "database does not exist"

**Solution** : Créer la base de données
```bash
createdb -U postgres aiplatform
```

## 📊 Comptes de Test

Après avoir exécuté `python scripts/init_db.py` :

**Teacher** :
- Email : `teacher@test.com`
- Password : `password123`

**Student** :
- Email : `student@test.com`
- Password : `password123`

