# Guide d'Installation PostgreSQL

## 📦 Installation PostgreSQL

### Windows
1. Télécharger depuis : https://www.postgresql.org/download/windows/
2. Installer avec l'installateur
3. Noter le mot de passe du superutilisateur `postgres`

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Mac
```bash
brew install postgresql
brew services start postgresql
```

## 🗄️ Créer la Base de Données

### Méthode 1 : Via psql (Recommandé)

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans le shell PostgreSQL
CREATE DATABASE aiplatform;

# Vérifier que la base existe
\l

# Quitter
\q
```

### Méthode 2 : Via ligne de commande

```bash
createdb -U postgres aiplatform
```

### Méthode 3 : Via pgAdmin (Interface graphique)

1. Ouvrir pgAdmin
2. Clic droit sur "Databases" → "Create" → "Database"
3. Nom : `aiplatform`
4. Cliquer sur "Save"

## ⚙️ Configuration

### 1. Créer le fichier `.env`

```bash
cp .env.example .env
```

### 2. Modifier `.env` avec vos paramètres

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiplatform
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 3. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

## 🚀 Initialiser la Base de Données

### Option 1 : Avec Flask-Migrate (Recommandé)

```bash
# Initialiser les migrations
flask db init

# Créer la première migration
flask db migrate -m "Initial migration"

# Appliquer les migrations (créer les tables)
flask db upgrade
```

### Option 2 : Avec le script Python

```bash
python scripts/init_db.py
```

## ✅ Vérifier la Connexion

### Test rapide

```bash
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); print('✅ Connexion réussie!')"
```

### Vérifier les tables

```bash
psql -U postgres -d aiplatform -c "\dt"
```

Vous devriez voir :
- teachers
- students
- subjects
- courses
- course_files
- exercises

## 🔧 Dépannage

### Erreur : "psycopg2.OperationalError: could not connect to server"

**Solution** : Vérifier que PostgreSQL est démarré
```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Mac
brew services list
brew services start postgresql

# Windows
# Vérifier dans Services (services.msc) que "postgresql-x64-XX" est démarré
```

### Erreur : "password authentication failed"

**Solution** : Vérifier le mot de passe dans `.env`
- Par défaut, le mot de passe est celui défini lors de l'installation
- Ou modifier le fichier `pg_hba.conf` pour changer la méthode d'authentification

### Erreur : "database does not exist"

**Solution** : Créer la base de données
```bash
createdb -U postgres aiplatform
```

### Erreur : "permission denied"

**Solution** : Vérifier les permissions
```sql
GRANT ALL PRIVILEGES ON DATABASE aiplatform TO postgres;
```

## 📊 Commandes Utiles PostgreSQL

```bash
# Se connecter à la base
psql -U postgres -d aiplatform

# Lister les tables
\dt

# Voir la structure d'une table
\d teachers

# Compter les enregistrements
SELECT COUNT(*) FROM teachers;

# Voir tous les teachers
SELECT * FROM teachers;

# Quitter
\q
```

## 🔄 Migrations

### Créer une nouvelle migration

```bash
flask db migrate -m "Description de la migration"
```

### Appliquer les migrations

```bash
flask db upgrade
```

### Revenir en arrière

```bash
flask db downgrade
```

## 🎯 Prochaines Étapes

1. ✅ PostgreSQL installé
2. ✅ Base de données `aiplatform` créée
3. ✅ Fichier `.env` configuré
4. ✅ Dépendances installées (`psycopg2-binary`)
5. ✅ Migrations appliquées
6. ✅ Script `init_db.py` exécuté (données de test)

Votre backend Flask est maintenant connecté à PostgreSQL ! 🎉

