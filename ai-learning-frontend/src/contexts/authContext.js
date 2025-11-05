import { createContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";
import { saveToken, getToken, saveUser, getUser, clearAuthData } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";

// Gérer les sessions utilisateur
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si un token existe au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      const savedUser = getUser();

      if (token) {
        try {
          // Tenter de récupérer les données utilisateur depuis le serveur
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          console.warn("Token invalide ou expiré, déconnexion...");
          // Si le token est invalide, nettoyer les données
          clearAuthData();
          setUser(null);
        }
      } else if (savedUser) {
        // Si pas de token mais un utilisateur en cache, nettoyer
        clearAuthData();
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = (data) => {
    if (!data || !data.jwt || !data.user) {
      console.error("Données d'authentification invalides");
      return;
    }

    // Sauvegarder le token et les données utilisateur
    saveToken(data.jwt);
    saveUser(data.user);
    setUser(data.user);
    
    // Rediriger vers le dashboard
    navigate("/dashboard");
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};