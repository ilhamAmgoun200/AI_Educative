import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Vérifier si l'utilisateur est déjà connecté
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // Le type peut être dans userData.type (depuis to_dict), userData.userType, ou localStorage
        const userType = userData.type || userData.userType || localStorage.getItem('userType');
        if (userType === 'teacher') {
          setTeacherId(userData.id);
        }
      } catch (error) {
        // Token invalide, nettoyer
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      }
    }

    setLoading(false);
  };

  // Connexion
  const login = async (email, password, userType) => {
    try {
      if (!email || !password || !userType) {
        throw new Error('Email, mot de passe et type d\'utilisateur sont requis.');
      }

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        userType,
      });

      const { token, user: userData, userType: returnedUserType } = response.data;

      if (!token || !userData) {
        throw new Error('Réponse invalide du serveur.');
      }

      const finalUserType = returnedUserType || userType;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', finalUserType); // Stocker le type séparément
      
      setUser(userData);

      // Si teacher, stocker l'ID
      if (finalUserType === 'teacher') {
        setTeacherId(userData.id);
      }

      console.log('✅ Login réussi - UserType:', finalUserType);
      console.log('✅ User data:', userData);

      return { success: true, user: userData, userType: finalUserType };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || 'Erreur de connexion.';

        if (status === 400) {
          throw new Error(`❌ ${message}`);
        } else if (status === 401) {
          throw new Error('❌ Email ou mot de passe incorrect.');
        } else {
          throw new Error(`❌ Erreur serveur (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error('❌ Impossible de contacter le serveur. Vérifiez que Flask est démarré sur http://localhost:5000');
      } else {
        throw new Error(error.message || 'Erreur de connexion.');
      }
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
    setTeacherId(null);
  };

  // Récupérer le token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Vérifier si authentifié
  const isAuthenticated = () => {
    return !!getToken() && !!user;
  };

  const updateUser = (updatedUserData) => {
  setUser(prevUser => {
   const newUser = { ...prevUser, ...updatedUserData };
   // Mettre à jour le localStorage
   localStorage.setItem('user', JSON.stringify(newUser));
   return newUser;
   });
  };

  const value = {
    user,
    teacherId,
    loading,
    updateUser,
    login,
    logout,
    getToken,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
