import tensorflow as tf
import pickle
import numpy as np
import pandas as pd
import os
# On coupe les logs techniques inutiles
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from keras.preprocessing.sequence import pad_sequences


class RecommendationService:
    def __init__(self):
        # Chemins vers les fichiers (relatifs à la racine du projet)
        # Assurez-vous que l'arborescence est :
        # /votre_projet
        #   /src (ou app)
        #       service.py
        #   /model
        #       model_recommender_final.keras
        #       artifacts.pkl
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_dir, '..', 'model', 'model_recommender_final.keras')
        self.artifacts_path = os.path.join(base_dir, '..', 'model', 'artifacts.pkl')
        
        self.model = None
        self.artifacts = None
        self.load_resources()

    def load_resources(self):
        """Charge le modèle et les artefacts en mémoire"""
        print(f"--- Chargement des ressources depuis {self.model_path} ---")
        try:
            # Chargement du modèle Keras
            self.model = tf.keras.models.load_model(self.model_path)
            
            # Chargement des outils (Encodeurs, Scalers...)
            with open(self.artifacts_path, 'rb') as f:
                self.artifacts = pickle.load(f)
            
            # Extraction des outils
            self.filliere_enc = self.artifacts['filliere_enc']
            self.matiere_enc = self.artifacts['matiere_enc']
            self.course_name_enc = self.artifacts['course_name_enc']
            self.scaler_age = self.artifacts['scaler_age']
            self.name_to_idx_map = self.artifacts['name_to_idx_map']
            self.max_history_len = self.artifacts.get('max_history_len', 10) # Par défaut 10
            
            print("✅ Modèle chargé avec succès !")
        except Exception as e:
            print(f"❌ Erreur critique au chargement : {e}")
            raise e

    def preprocess_input(self, data):
        """Transforme le JSON brut en Dictionnaire d'entrées pour le modèle"""
        try:
            # 1. Encodages (+1 car le modèle a appris avec indices commençant à 1)
            # On gère le cas où la filière ou matière est inconnue
            try:
                f_idx = self.filliere_enc.transform([data['user_filliere']])[0] + 1
                m_idx = self.matiere_enc.transform([data['target_matiere']])[0] + 1
                c_idx = self.course_name_enc.transform([data['target_course_name']])[0] + 1
            except ValueError as e:
                # Si une valeur n'est pas dans les encodeurs
                return None, f"Valeur inconnue détectée (Filière, Matière ou Cours incorrect) : {e}"
            
            # 2. Age (On passe par un DataFrame pour éviter le warning sklearn)
            age_df = pd.DataFrame([[data['user_age']]], columns=['user_age'])
            age_norm = self.scaler_age.transform(age_df)[0][0]

            # 3. Historique (Liste de noms -> Indices)
            raw_history = data.get('user_history_names', [])
            hist_idxs = [self.name_to_idx_map.get(name, 0) for name in raw_history]
            
            # Padding
            hist_padded = pad_sequences([hist_idxs], maxlen=self.max_history_len, padding='post', value=0)

            # 4. Construction du Dictionnaire (Format Two-Tower)
            # Les clés DOIVENT correspondre aux noms des couches Input du modèle
            inputs = {
                "Filliere": np.array([f_idx], dtype='int32'),
                "Age": np.array([age_norm], dtype='float32'),
                "History": hist_padded.astype('int32'),
                "Target_Course": np.array([c_idx], dtype='int32'),
                "Target_Matiere": np.array([m_idx], dtype='int32')
            }
            return inputs, None

        except Exception as e:
            return None, f"Erreur interne de pré-traitement : {str(e)}"

    def predict(self, data):
        """Fonction principale appelée par la route"""
        # Préparation
        inputs, error = self.preprocess_input(data)
        
        if error:
            return {'error': error, 'recommandation': False, 'score': 0}, 400

        # Inférence
        try:
            score = self.model.predict(inputs, verbose=0)[0][0]
            score_float = float(score) # Conversion numpy -> float python
            
            # Logique de réponse
            return {
                'target_course': data['target_course_name'],
                'score_confiance': round(score_float, 4),
                'recommandation': bool(score_float > 0.65), # Seuil ajusté à 0.65 (plus prudent)
                'message': "Contenu pertinent" if score_float > 0.65 else "Contenu peu adapté"
            }, 200
            
        except Exception as e:
            return {'error': f"Erreur lors de la prédiction : {e}"}, 500

# Singleton pour l'import
rec_service = RecommendationService()