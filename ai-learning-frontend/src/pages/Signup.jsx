import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { AuthContext } from "../contexts/authContext"; // IMPORT AJOUTÉ

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext); // UTILISATION DU CONTEXTE

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // Défaut corrigé à "student"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Validation des champs
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mise à jour des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Inscription en cours avec rôle:", formData.role);
      
      // Appel à l'API d'inscription
      const authData = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );

      console.log("✅ Inscription réussie:", authData);
      
      // CONNEXION AUTOMATIQUE APRÈS INSCRIPTION
      if (authData && authData.jwt && authData.user) {
        setSuccessMessage(`Compte ${formData.role} créé avec succès ! Connexion automatique...`);
        
        // Utiliser le AuthContext pour connecter l'utilisateur
        // Cela déclenchera la redirection automatique selon le rôle
        loginUser(authData);
      } else {
        throw new Error("Données d'authentification manquantes");
      }
      
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err.response?.data || err.message);
      
      // Gestion d'erreur détaillée
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      if (err.response?.data?.error) {
        // Erreur de validation Strapi
        if (err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.response.data.error.details?.errors) {
          // Erreurs de validation détaillées
          const errors = err.response.data.error.details.errors;
          const firstError = Object.values(errors)[0];
          errorMessage = firstError?.[0]?.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full relative z-10">
        <div className="bg-gray-50 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-xl">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">🧠</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              Créer un compte
            </h1>
            <p className="text-slate-600">
              Rejoignez LearnAI et commencez votre apprentissage
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 ${
                  validationErrors.username ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Ex: BassmaDev"
                required
              />
              {validationErrors.username && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 ${
                  validationErrors.email ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="votre@email.com"
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Sélection du rôle - AMÉLIORÉ */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: "student" }))}
                  className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                    formData.role === "student" 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">👨‍🎓 Étudiant</div>
                  <div className="text-xs opacity-70">Apprendre</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: "teacher" }))}
                  className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                    formData.role === "teacher" 
                      ? "border-green-500 bg-green-50 text-green-700" 
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">👨‍🏫 Professeur</div>
                  <div className="text-xs opacity-70">Enseigner</div>
                </button>
              </div>
              <input
                type="hidden"
                name="role"
                value={formData.role}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Sélectionné: <span className="font-semibold capitalize">{formData.role}</span>
              </p>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 ${
                  validationErrors.password ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Minimum 6 caractères"
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 ${
                  validationErrors.confirmPassword ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Répétez votre mot de passe"
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Message de succès */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-green-600 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {/* Message d'erreur général */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Bouton principal */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                `Créer mon compte ${formData.role === 'teacher' ? 'professeur' : 'étudiant'}`
              )}
            </button>
          </form>

          {/* Lien vers Login */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">© 2025 LearnAI. Apprenez avec l'IA</p>
        </div>
      </div>
    </div>
  );
}