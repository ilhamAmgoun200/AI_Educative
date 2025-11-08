
import { createContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";
import { saveToken, getToken, saveUser, getUser, clearAuthData } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction pour déterminer le rôle de l'utilisateur - CORRIGÉE
 const getUserRole = (userData) => {
  if (!userData) {
    console.warn('⚠️ Aucun userData fourni, utilisation du rôle par défaut (student)');
    return 'student';
  }
  
  console.log('🔍 Structure userData reçue:', userData);
  
  // Vérifier si le rôle est peuplé (devrait l'être grâce à populate=role)
  if (userData.role && typeof userData.role === 'object') {
    const roleName = userData.role.name || userData.role.type;
    console.log('🎭 Rôle détecté:', roleName);
    
    if (roleName) {
      const normalizedRole = roleName.toLowerCase();
      
      // Mapping des rôles possibles
      if (normalizedRole.includes('teacher') || 
          normalizedRole.includes('professor') || 
          normalizedRole.includes('enseignant') ||
          normalizedRole.includes('formateur')) {
        return 'teacher';
      } else if (normalizedRole.includes('student') || 
                 normalizedRole.includes('étudiant') || 
                 normalizedRole.includes('eleve')) {
        return 'student';
      }
      
      console.warn(`⚠️ Rôle non reconnu: "${roleName}", utilisation par défaut (student)`);
      return 'student';
    }
  }
  
  // Si le rôle n'est pas peuplé (ne devrait pas arriver avec populate=role)
  if (userData.role && typeof userData.role === 'number') {
    console.error('❌ Rôle non peuplé! Vérifiez que populate=role fonctionne dans getMe()');
    // Ne pas refaire d'appel API pour éviter les boucles infinies
  }
  
  // Fallback basé sur des champs métier (optionnel)
  if (userData.isTeacher) {
    return 'teacher';
  }
  
  console.warn('⚠️ Rôle non détecté, utilisation par défaut (student)');
  return 'student';
};

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
          
          // Rediriger selon le rôle au chargement de l'app
          const role = await getUserRole(userData);
          console.log('🧭 Redirection selon rôle:', userData.role);
          
          if (role === 'teacher' || role === 'professor' || role === 'enseignant') {
            console.log('👨‍🏫 Redirection vers dashboard prof');
            navigate("/teacher/dashboard");
          } else {
            console.log('👨‍🎓 Redirection vers dashboard étudiant');
            navigate("/dashboard");
          }
          
        } catch (error) {
          console.warn("Token invalide ou expiré, déconnexion...");
          clearAuthData();
          setUser(null);
        }
      } else if (savedUser) {
        clearAuthData();
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const loginUser = async (data) => {
    if (!data || !data.jwt || !data.user) {
      console.error("Données d'authentification invalides");
      return;
    }

    // Sauvegarder le token et les données utilisateur
    saveToken(data.jwt);
    saveUser(data.user);
    setUser(data.user);
    
    // Déterminer le rôle et rediriger
    const role = await getUserRole(data.user);
    console.log('🔐 Connexion réussie, rôle détecté:', role);
    
    if (role === 'teacher' || role === 'professor' || role === 'enseignant') {
      console.log('👨‍🏫 Redirection vers dashboard prof');
      navigate("/teacher/dashboard");
    } else {
      console.log('👨‍🎓 Redirection vers dashboard étudiant');
      navigate("/dashboard");
    }
  };

  const logout = () => {
    console.log('🚪 Déconnexion');
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