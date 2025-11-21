@echo off
REM Script de démarrage pour Windows

echo 🚀 Démarrage du backend Flask avec PostgreSQL...

REM Vérifier si PostgreSQL est installé
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Créer la base de données si elle n'existe pas
echo 📦 Vérification de la base de données...
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'aiplatform'" | findstr /C:"1" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Création de la base de données...
    psql -U postgres -c "CREATE DATABASE aiplatform;"
)

echo ✅ Base de données 'aiplatform' prête

REM Créer l'environnement virtuel si nécessaire
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
echo 📦 Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer les dépendances
echo 📦 Installation des dépendances...
pip install -r requirements.txt

REM Créer le fichier .env s'il n'existe pas
if not exist ".env" (
    echo 📝 Création du fichier .env...
    (
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=aiplatform
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres
        echo JWT_SECRET_KEY=your-secret-key-change-in-production
        echo FLASK_ENV=development
        echo FLASK_DEBUG=True
    ) > .env
    echo ✅ Fichier .env créé. Veuillez modifier le mot de passe si nécessaire.
)

REM Initialiser les migrations
if not exist "migrations" (
    echo 📦 Initialisation des migrations...
    flask db init
)

REM Créer et appliquer les migrations
echo 📦 Création des migrations...
flask db migrate -m "Initial migration"

echo 📦 Application des migrations...
flask db upgrade

REM Initialiser avec des données de test
echo 📦 Initialisation avec des données de test...
python scripts\init_db.py

echo.
echo ✅ Tout est prêt!
echo 🚀 Démarrage du serveur Flask...
echo.
python run.py

pause

