#!/bin/bash

# Script de démarrage pour le backend Flask avec PostgreSQL

echo "🚀 Démarrage du backend Flask avec PostgreSQL..."

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si PostgreSQL est en cours d'exécution
if ! pg_isready -U postgres &> /dev/null; then
    echo "⚠️  PostgreSQL n'est pas démarré. Démarrage..."
    # Sur Linux
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    # Sur Mac
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    fi
fi

# Créer la base de données si elle n'existe pas
echo "📦 Vérification de la base de données..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'aiplatform'" | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE aiplatform;"

echo "✅ Base de données 'aiplatform' prête"

# Installer les dépendances si nécessaire
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

echo "📦 Activation de l'environnement virtuel..."
source venv/bin/activate

echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
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
    echo "✅ Fichier .env créé. Veuillez modifier le mot de passe si nécessaire."
fi

# Initialiser les migrations
if [ ! -d "migrations" ]; then
    echo "📦 Initialisation des migrations..."
    flask db init
fi

# Créer et appliquer les migrations
echo "📦 Création des migrations..."
flask db migrate -m "Initial migration"

echo "📦 Application des migrations..."
flask db upgrade

# Initialiser avec des données de test
echo "📦 Initialisation avec des données de test..."
python scripts/init_db.py

echo ""
echo "✅ Tout est prêt!"
echo "🚀 Démarrage du serveur Flask..."
echo ""
python run.py

