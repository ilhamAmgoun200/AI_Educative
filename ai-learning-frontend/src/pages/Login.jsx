import React, { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../contexts/authContext";

export default function Login() {
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLogin, setIsLogin] = useState(true); // 🔹 pour basculer entre login et register
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 met à jour les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ⚡ Appel vers Strapi : /api/auth/local
      const data = await login(formData.email, formData.password);

      // ✅ AuthContext : sauvegarde token + user + redirection vers /home
      loginUser(data);
    } catch (err) {
      console.error(err);
      setError("❌ Identifiants incorrects ou serveur indisponible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Effets décoratifs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500 rounded-full opacity-20 blur-xl floating"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-500 rounded-full opacity-30 blur-lg floating" style={{ animationDelay: "2s" }}></div>

      <div className="max-w-md w-full relative z-10">
        {/* Carte Principale */}
        <div className="bg-gray-50 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-xl">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform transition-transform duration-300 hover:scale-110">
              <span className="text-2xl font-bold text-white">🧠</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              LearnAI
            </h1>
            <p className="text-slate-600">
              {isLogin ? "Bienvenue de retour !" : "Créez votre compte"}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

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
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Bas de page */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Pas de compte ?{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
              >
                Créer un compte
              </button>
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
