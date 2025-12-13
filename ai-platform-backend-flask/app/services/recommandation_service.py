import tensorflow as tf
import pickle
import numpy as np
import pandas as pd
import os
import traceback
# On coupe les logs techniques inutiles
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from keras.preprocessing.sequence import pad_sequences


class RecommendationService:
    def __init__(self):
        # Chemins vers les fichiers (relatifs à la racine du projet)
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
            self.max_history_len = self.artifacts.get('max_history_len', 10)
            
            print("✅ Modèle chargé avec succès !")
            print(f"📊 Filieres connues: {list(self.filliere_enc.classes_)}")
            print(f"📊 Matieres connues: {list(self.matiere_enc.classes_)}")
            print(f"📊 Nombre de cours connus: {len(self.course_name_enc.classes_)}")
            print(f"📊 Premiers cours: {list(self.course_name_enc.classes_[:10])}")
            
        except Exception as e:
            print(f"❌ Erreur critique au chargement : {e}")
            traceback.print_exc()
            raise e

    def preprocess_input(self, data):
        """Transforme le JSON brut en Dictionnaire d'entrées pour le modèle"""
        try:
            print(f"\n🔍 [PREPROCESSING] Course: {data.get('target_course_name')}")
            print(f"   Input - Filliere: '{data.get('user_filliere')}'")
            print(f"   Input - Matiere: '{data.get('target_matiere')}'")
            print(f"   Input - Age: {data.get('user_age')}")
            print(f"   Input - History: {data.get('user_history_names', [])}")
            
            # 1. Encodages (+1 car le modèle a appris avec indices commençant à 1)
            try:
                filliere_input = data['user_filliere']
                matiere_input = data['target_matiere']
                course_input = data['target_course_name']
                
                # Vérifier si les valeurs existent dans les encodeurs
                if filliere_input not in self.filliere_enc.classes_:
                    print(f"   ❌ Filliere '{filliere_input}' inconnue!")
                    print(f"   Filieres valides: {list(self.filliere_enc.classes_)}")
                    return None, f"Filière inconnue: {filliere_input}"
                
                if matiere_input not in self.matiere_enc.classes_:
                    print(f"   ❌ Matiere '{matiere_input}' inconnue!")
                    print(f"   Matieres valides: {list(self.matiere_enc.classes_)}")
                    return None, f"Matière inconnue: {matiere_input}"
                
                if course_input not in self.course_name_enc.classes_:
                    print(f"   ❌ Course '{course_input}' inconnu!")
                    print(f"   Suggestion: Premiers cours connus: {list(self.course_name_enc.classes_[:5])}")
                    return None, f"Cours inconnu: {course_input}"
                
                f_idx = self.filliere_enc.transform([filliere_input])[0] + 1
                m_idx = self.matiere_enc.transform([matiere_input])[0] + 1
                c_idx = self.course_name_enc.transform([course_input])[0] + 1
                
                print(f"   ✅ Encodage réussi:")
                print(f"      Filliere '{filliere_input}' → {f_idx}")
                print(f"      Matiere '{matiere_input}' → {m_idx}")
                print(f"      Course '{course_input}' → {c_idx}")
                
            except ValueError as e:
                print(f"   ❌ Erreur ValueError: {e}")
                traceback.print_exc()
                return None, f"Erreur d'encodage: {e}"
            
            # 2. Age (On passe par un DataFrame pour éviter le warning sklearn)
            age_df = pd.DataFrame([[data['user_age']]], columns=['user_age'])
            age_norm = self.scaler_age.transform(age_df)[0][0]
            print(f"      Age {data['user_age']} → {age_norm:.4f}")

            # 3. Historique (Liste de noms -> Indices)
            raw_history = data.get('user_history_names', [])
            hist_idxs = [self.name_to_idx_map.get(name, 0) for name in raw_history]
            hist_padded = pad_sequences([hist_idxs], maxlen=self.max_history_len, padding='post', value=0)
            print(f"      History: {len(raw_history)} cours → shape {hist_padded.shape}")

            # 4. Construction du Dictionnaire (Format Two-Tower)
            inputs = {
                "Filliere": np.array([f_idx], dtype='int32'),
                "Age": np.array([age_norm], dtype='float32'),
                "History": hist_padded.astype('int32'),
                "Target_Course": np.array([c_idx], dtype='int32'),
                "Target_Matiere": np.array([m_idx], dtype='int32')
            }
            
            print(f"   ✅ Inputs créés: {list(inputs.keys())}")
            for k, v in inputs.items():
                print(f"      {k}: shape={v.shape}, dtype={v.dtype}, sample={v.flatten()[:3]}")
            
            return inputs, None

        except Exception as e:
            print(f"   ❌ Exception dans preprocessing: {e}")
            traceback.print_exc()
            return None, f"Erreur interne de pré-traitement : {str(e)}"

    def predict(self, data):
        """Fonction principale appelée par la route"""
        print(f"\n{'='*60}")
        print(f"🎯 [PREDICT START] Course: {data.get('target_course_name')}")
        print(f"{'='*60}")
        
        # Préparation
        inputs, error = self.preprocess_input(data)
        
        if error:
            print(f"❌ [PREDICT] Erreur preprocessing: {error}")
            return {'error': error, 'recommandation': False, 'score': None}, 400

        # Inférence
        try:
            print(f"\n🤖 [MODEL INFERENCE] Appel du modèle...")
            score = self.model.predict(inputs, verbose=0)[0][0]
            print(f"   ✅ Score brut retourné: {score} (type: {type(score)})")
            
            score_float = float(score)
            print(f"   ✅ Score converti: {score_float}")
            
            # Logique de réponse
            result = {
                'target_course': data['target_course_name'],
                'score_confiance': round(score_float, 4),
                'recommandation': bool(score_float > 0.65),
                'message': "Contenu pertinent" if score_float > 0.65 else "Contenu peu adapté"
            }
            
            print(f"   ✅ Résultat final: {result}")
            print(f"{'='*60}\n")
            return result, 200
            
        except Exception as e:
            print(f"   ❌ Exception pendant la prédiction: {e}")
            traceback.print_exc()
            print(f"{'='*60}\n")
            return {'error': f"Erreur lors de la prédiction : {e}", 'score': None}, 500

# Singleton pour l'import
rec_service = RecommendationService()