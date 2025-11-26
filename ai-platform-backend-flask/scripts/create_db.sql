-- Script SQL pour créer la base de données PostgreSQL
-- Exécuter avec: psql -U postgres -f scripts/create_db.sql

-- Créer la base de données
CREATE DATABASE aiplatform;

-- Se connecter à la base de données (à faire manuellement)
-- \c aiplatform

-- Créer un utilisateur dédié (optionnel)
-- CREATE USER aiplatform_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE aiplatform TO aiplatform_user;

-- Les tables seront créées automatiquement par Flask-Migrate
-- Pas besoin de créer les tables manuellement

